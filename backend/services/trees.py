"""
services/trees.py — Botanical selection logic for CanopyROI.

Provides species recommendations based on:
- City climate zone
- LST (temperature stress)
- NDVI (existing greenery)
- Soil type (approximated from zone name)
- Fallback for unknown zones
"""

from __future__ import annotations


# ── Species database ───────────────────────────────────────────────────────

_SPECIES_DB: dict[str, list[str]] = {
    # Maharashtra — semi-arid plateau
    "Kothrud":       ["Neem", "Peepal", "Arjun", "Gulmohar", "Amla"],
    "Wanowrie":      ["Neem", "Peepal", "Amaltas", "Karanj", "Bael"],
    "Dhanori":       ["Neem", "Peepal", "Banyan", "Pilkhan", "Arjun"],
    "Shivajinagar":  ["Rain Tree", "Gulmohar", "Neem", "Peepal", "Jacaranda"],
    "Baner":         ["Silver Oak", "Neem", "Arjun", "Pongamia", "Cassia"],
    "Hinjewadi":     ["Neem", "Bamboo Cluster", "Arjun", "Saptaparni", "Moringa"],
    "Hadapsar":      ["Neem", "Banyan", "Peepal", "Tamarind", "Rain Tree"],
    "Viman Nagar":   ["Neem", "Gulmohar", "Peepal", "Cassia", "Kadamba"],
    "Katraj":        ["Neem", "Peepal", "Karanj", "Moringa", "Drumstick"],
    "Aundh":         ["Silver Oak", "Gulmohar", "Neem", "Rain Tree", "Peepal"],
    "Koregaon Park": ["Rain Tree", "Jacaranda", "Neem", "Peepal", "Gulmohar"],
    "Kondhwa":       ["Neem", "Peepal", "Arjun", "Moringa", "Karanj"],
    # Fallback
    "default":       ["Neem", "Peepal", "Banyan", "Tamarind", "Mixed Native"],
}

# Soil suitability — simplified for demo
_SOIL_UNSUITABLE = {
    # Water-logged zones — avoid deep-root species
    "Dhanori": ["Banyan"],
}


# ── Public interface ───────────────────────────────────────────────────────

def recommend_species(
    zone_name: str,
    lst: float,
    ndvi: float,
) -> list[str]:
    """
    Returns ordered list of recommended tree species for a given zone.
    Filters out soil-incompatible species.
    Prioritises drought-tolerant species if LST > 43 (extreme heat).
    """
    raw = _SPECIES_DB.get(zone_name, _SPECIES_DB["default"]).copy()

    # Filter soil-unsuitable species
    excluded = _SOIL_UNSUITABLE.get(zone_name, [])
    filtered = [s for s in raw if s not in excluded]

    # If extremely hot, move drought-tolerant species to top
    if lst > 43.0:
        drought_tolerant = {"Neem", "Moringa", "Khejri (Shami)", "Karanj", "Arjun"}
        filtered.sort(key=lambda s: 0 if s in drought_tolerant else 1)

    return filtered if filtered else _SPECIES_DB["default"]


def fallback_species(zone_name: str) -> list[str]:
    """Return fallback species for a zone — always safe choices."""
    return ["Neem", "Moringa", "Arjun", "Peepal"]


def get_survival_rate(species: str, lst: float, ndvi: float) -> float:
    """
    Estimate 5-year survival rate (0.0-1.0) based on species and conditions.
    Rough heuristic for ESG report.
    """
    base = 0.85
    if lst > 44:
        base -= 0.10
    if ndvi < 0.15:
        base -= 0.05   # Degraded soil → harder establishment
    if species in {"Neem", "Moringa", "Arjun"}:
        base += 0.05   # Native hardy species bonus
    return min(max(base, 0.40), 0.98)
