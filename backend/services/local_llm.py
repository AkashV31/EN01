from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from typing import Any, Optional

import httpx

logger = logging.getLogger("canopyroi.local_llm")


def _extract_json(text: str) -> dict[str, Any]:
    raw = text.strip()
    if raw.startswith("{") and raw.endswith("}"):
        return json.loads(raw)
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        raise ValueError("No JSON object found in local LLM response")
    return json.loads(match.group(0))


class LocalLLMClient:
    """
    Supports:
    - OpenAI-compatible local servers (LM Studio / vLLM / Ollama OpenAI mode)
      provider=openai_compatible
    - Ollama native chat API
      provider=ollama
    """

    def __init__(self) -> None:
        self.provider = os.getenv("LOCAL_LLM_PROVIDER", "openai_compatible").strip().lower()
        self.base_url = os.getenv("LOCAL_LLM_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
        self.model = os.getenv("LOCAL_LLM_MODEL", "canopy-local")
        self.timeout = float(os.getenv("LOCAL_LLM_TIMEOUT_SECONDS", "20"))

    @property
    def is_configured(self) -> bool:
        return bool(self.base_url and self.model)

    async def chat_json(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: float = 0.1,
        max_tokens: int = 700,
        retries: int = 1,
    ) -> dict[str, Any]:
        if not self.is_configured:
            raise RuntimeError("Local LLM is not configured.")

        last_error: Optional[Exception] = None
        for attempt in range(retries + 1):
            try:
                if self.provider == "ollama":
                    return await self._chat_json_ollama(system_prompt, user_prompt, temperature, max_tokens)
                return await self._chat_json_openai_compatible(
                    system_prompt, user_prompt, temperature, max_tokens
                )
            except Exception as exc:  # pragma: no cover - runtime network path
                last_error = exc
                logger.warning(
                    "Local LLM request failed (attempt %s/%s): %s",
                    attempt + 1,
                    retries + 1,
                    exc,
                )
                if attempt < retries:
                    await asyncio.sleep(0.5 * (attempt + 1))

        assert last_error is not None
        raise last_error

    async def _chat_json_openai_compatible(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        max_tokens: int,
    ) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(f"{self.base_url}/v1/chat/completions", json=payload)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return _extract_json(content)

    async def _chat_json_ollama(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        max_tokens: int,
    ) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "stream": False,
            "format": "json",
            "options": {"temperature": temperature, "num_predict": max_tokens},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(f"{self.base_url}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            content = data.get("message", {}).get("content", "{}")
            return _extract_json(content)


_singleton: Optional[LocalLLMClient] = None


def get_local_llm_client() -> LocalLLMClient:
    global _singleton
    if _singleton is None:
        _singleton = LocalLLMClient()
    return _singleton
