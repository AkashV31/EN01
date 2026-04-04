from __future__ import annotations

import logging
import os
import re
from typing import Any

from services.groq_client import get_groq_client
from services.local_llm import get_local_llm_client
from services.parser import parse_intent

logger = logging.getLogger("canopyroi.agentic")

_VALID_TREE_TYPES = {"native", "neem", "peepal", "banyan", "palm", "gulmohar", "khejri", "teak", "mixed"}
_VALID_PRIORITIES = {"heat_reduction", "carbon_sequestration", "shade_coverage", "biodiversity"}
_LOCAL_LLM_PREFERRED = os.getenv("LOCAL_LLM_PREFERRED", "true").strip().lower() in {"1", "true", "yes", "on"}


def _extract_budget_regex(text: str) -> int:
    lower = text.lower()
    lakh = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l\b)", lower)
    if lakh:
        return int(float(lakh.group(1)) * 100_000)
    crore = re.search(r"(\d+(?:\.\d+)?)\s*(?:crore|cr\b)", lower)
    if crore:
        return int(float(crore.group(1)) * 10_000_000)
    plain = re.search(r"[₹$]?([\d,]+)\s*(k)?", lower)
    if plain:
        raw = int(plain.group(1).replace(",", ""))
        return raw * 1000 if plain.group(2) == "k" else raw
    return 500_000


def _extract_zone_regex(text: str, location_candidates: list[dict[str, Any]]) -> str | None:
    lower = text.lower()
    for candidate in location_candidates:
        zone_name = str(candidate.get("zone_name", ""))
        if zone_name and zone_name.lower() in lower:
            return zone_name
    return None


def _coerce_recommended_locations(raw: Any, fallback: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if isinstance(raw, list):
        cleaned = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            if not item.get("zone_name"):
                continue
            cleaned.append(
                {
                    "zone_name": str(item.get("zone_name")),
                    "city": str(item.get("city", "Pune")),
                    "state": str(item.get("state", "Maharashtra")),
                    "lat": float(item.get("lat", 0.0)),
                    "lon": float(item.get("lon", 0.0)),
                    "ndvi": float(item.get("ndvi", 0.0)),
                    "lst": float(item.get("lst", 0.0)),
                    "compliance_score": float(item.get("compliance_score", 1.0)),
                    "reason": str(item.get("reason", "High impact and feasible intervention zone.")),
                }
            )
        if cleaned:
            return cleaned[:8]
    return [
        {
            **candidate,
            "reason": "High heat and low vegetation profile for better intervention ROI.",
        }
        for candidate in fallback[:6]
    ]


def _fallback_parse(prompt: str, location_candidates: list[dict[str, Any]]) -> dict[str, Any]:
    base = parse_intent(prompt)
    target_zone = _extract_zone_regex(prompt, location_candidates)
    recommendations = []
    for candidate in location_candidates[:6]:
        recommendations.append(
            {
                **candidate,
                "reason": f"{candidate['zone_name']} has strong heat mitigation potential with NDVI {candidate['ndvi']}.",
            }
        )

    return {
        "budget": int(base.get("budget", _extract_budget_regex(prompt))),
        "target_zone": target_zone,
        "tree_type": base.get("tree_type", "native"),
        "priority": base.get("priority", "heat_reduction"),
        "recommended_locations": recommendations,
        "llm_source": "rule_based",
        "reasoning": "Rule-based fallback parser used because external LLMs were unavailable.",
    }


def _validate_parse_response(
    parsed: dict[str, Any],
    prompt: str,
    location_candidates: list[dict[str, Any]],
    llm_source: str,
) -> dict[str, Any]:
    budget = parsed.get("budget", _extract_budget_regex(prompt))
    if not isinstance(budget, (int, float)) or budget <= 0:
        budget = _extract_budget_regex(prompt)

    tree_type = str(parsed.get("tree_type", "native")).lower()
    if tree_type not in _VALID_TREE_TYPES:
        tree_type = "native"

    priority = str(parsed.get("priority", "heat_reduction")).lower()
    if priority not in _VALID_PRIORITIES:
        priority = "heat_reduction"

    target_zone = parsed.get("target_zone") or _extract_zone_regex(prompt, location_candidates)
    recommendations = _coerce_recommended_locations(parsed.get("recommended_locations"), location_candidates)
    reasoning = str(parsed.get("reasoning", "")).strip() or "LLM generated structured planning intent."

    return {
        "budget": int(budget),
        "target_zone": target_zone,
        "tree_type": tree_type,
        "priority": priority,
        "recommended_locations": recommendations,
        "llm_source": llm_source,
        "reasoning": reasoning,
    }


def _location_digest(location_candidates: list[dict[str, Any]]) -> str:
    chunks = []
    for candidate in location_candidates[:12]:
        chunks.append(
            f"{candidate['zone_name']}|{candidate['city']}|lst={candidate['lst']}|"
            f"ndvi={candidate['ndvi']}|compliance={candidate['compliance_score']}"
        )
    return "\n".join(chunks)


async def parse_prompt_with_groq(prompt: str, location_candidates: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    candidates = location_candidates or []
    groq_client = get_groq_client()
    local_client = get_local_llm_client()

    system_prompt = """
You are CanopyROI's planning parser.
Return ONLY JSON:
{
  "budget": integer INR,
  "target_zone": string or null,
  "tree_type": "native|neem|peepal|banyan|palm|gulmohar|khejri|teak|mixed",
  "priority": "heat_reduction|carbon_sequestration|shade_coverage|biodiversity",
  "recommended_locations": [
    {
      "zone_name": "...",
      "city": "...",
      "lat": number,
      "lon": number,
      "ndvi": number,
      "lst": number,
      "compliance_score": number,
      "reason": "short text"
    }
  ],
  "reasoning": "1 short sentence"
}
Use the provided location candidates only.
"""
    user_prompt = (
        f"User prompt:\n{prompt}\n\n"
        f"Location candidates:\n{_location_digest(candidates)}\n\n"
        "Pick up to 6 recommended_locations."
    )

    providers = (
        [("local_llm", local_client), ("groq", groq_client)]
        if _LOCAL_LLM_PREFERRED
        else [("groq", groq_client), ("local_llm", local_client)]
    )
    for provider_name, client in providers:
        if not client.is_configured:
            continue
        try:
            parsed = await client.chat_json(system_prompt, user_prompt, max_tokens=700)
            logger.info("parse_prompt source=%s", provider_name)
            return _validate_parse_response(parsed, prompt, candidates, provider_name)
        except Exception as exc:
            logger.warning("%s parse failed, trying next provider: %s", provider_name, exc)

    logger.info("parse_prompt source=rule_based")
    return _fallback_parse(prompt, candidates)


async def enrich_optimization_with_llm(
    *,
    selected_zone_names: list[str],
    alternatives: list[dict[str, Any]],
    priority: str,
    tree_type: str,
    drought_resilient_insights: list[str],
    fallback_tree_suggestions: list[str],
) -> dict[str, Any]:
    groq_client = get_groq_client()
    local_client = get_local_llm_client()
    system_prompt = """
You are CanopyROI's optimization reasoning assistant.
Return ONLY JSON:
{
  "zone_reasoning": "2 concise sentences max",
  "drought_resilient_insights": ["...", "...", "..."],
  "fallback_tree_suggestions": ["...", "...", "..."]
}
"""
    user_prompt = (
        f"Priority={priority}\n"
        f"Requested tree={tree_type}\n"
        f"Selected zones={selected_zone_names[:8]}\n"
        f"Alternatives={alternatives[:5]}\n"
        f"Base drought insights={drought_resilient_insights}\n"
        f"Base fallback suggestions={fallback_tree_suggestions}"
    )

    providers = (
        [("local_llm", local_client), ("groq", groq_client)]
        if _LOCAL_LLM_PREFERRED
        else [("groq", groq_client), ("local_llm", local_client)]
    )
    for provider_name, client in providers:
        if not client.is_configured:
            continue
        try:
            data = await client.chat_json(system_prompt, user_prompt, max_tokens=500)
            logger.info("optimize_enrichment source=%s", provider_name)
            return {
                "zone_reasoning": data.get("zone_reasoning"),
                "drought_resilient_insights": data.get("drought_resilient_insights", drought_resilient_insights),
                "fallback_tree_suggestions": data.get("fallback_tree_suggestions", fallback_tree_suggestions),
                "llm_source": provider_name,
            }
        except Exception as exc:
            logger.warning("%s optimization enrichment failed: %s", provider_name, exc)

    return {
        "zone_reasoning": (
            f"Zones were selected for {priority} by maximizing heat-reduction potential per budget. "
            "Alternatives are ranked by environmental urgency and compliance feasibility."
        ),
        "drought_resilient_insights": drought_resilient_insights,
        "fallback_tree_suggestions": fallback_tree_suggestions,
        "llm_source": "rule_based",
    }


async def generate_esg_summary(metrics: dict[str, Any], selected_zone_names: list[str]) -> tuple[str, str]:
    groq_client = get_groq_client()
    local_client = get_local_llm_client()
    system_prompt = """
You are an ESG report writer for municipal forestry projects.
Return ONLY JSON:
{"summary":"max 2 concise sentences with measurable outcomes"}
"""
    user_prompt = f"Metrics={metrics}\nSelected zones={selected_zone_names[:8]}"

    providers = (
        [("local_llm", local_client), ("groq", groq_client)]
        if _LOCAL_LLM_PREFERRED
        else [("groq", groq_client), ("local_llm", local_client)]
    )
    for provider_name, client in providers:
        if not client.is_configured:
            continue
        try:
            data = await client.chat_json(system_prompt, user_prompt, max_tokens=220)
            summary = str(data.get("summary", "")).strip()
            if summary:
                logger.info("esg_summary source=%s", provider_name)
                return summary, provider_name
        except Exception as exc:
            logger.warning("%s ESG summary failed: %s", provider_name, exc)

    return (
        "Projected canopy intervention improves heat resilience and carbon outcomes in prioritized zones "
        "while keeping deployment aligned with budget and compliance constraints.",
        "rule_based",
    )
