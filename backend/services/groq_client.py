from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from typing import Any, Optional

logger = logging.getLogger("canopyroi.groq")

try:
    from groq import AsyncGroq
except Exception:  # pragma: no cover - handled at runtime when SDK is absent
    AsyncGroq = None  # type: ignore[assignment]


def _extract_json(raw: str) -> dict[str, Any]:
    text = raw.strip()
    if text.startswith("{") and text.endswith("}"):
        return json.loads(text)

    fenced = re.search(r"\{[\s\S]*\}", text)
    if fenced:
        return json.loads(fenced.group(0))
    raise ValueError("No JSON object found in model response")


class GroqClient:
    def __init__(self) -> None:
        self._api_key = os.getenv("GROQ_API_KEY")
        self._model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self._client = AsyncGroq(api_key=self._api_key) if (AsyncGroq and self._api_key) else None

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    async def chat_json(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: float = 0.2,
        max_tokens: int = 700,
        retries: int = 2,
    ) -> dict[str, Any]:
        if not self._client:
            raise RuntimeError("Groq is not configured. Set GROQ_API_KEY and install groq SDK.")

        last_error: Optional[Exception] = None
        for attempt in range(retries + 1):
            try:
                response = await self._client.chat.completions.create(
                    model=self._model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                )
                raw = response.choices[0].message.content or "{}"
                return _extract_json(raw)
            except Exception as exc:  # pragma: no cover - network/runtime path
                last_error = exc
                logger.warning("Groq request failed (attempt %s/%s): %s", attempt + 1, retries + 1, exc)
                if attempt < retries:
                    await asyncio.sleep(0.6 * (attempt + 1))

        assert last_error is not None
        raise last_error


_singleton: Optional[GroqClient] = None


def get_groq_client() -> GroqClient:
    global _singleton
    if _singleton is None:
        _singleton = GroqClient()
    return _singleton
