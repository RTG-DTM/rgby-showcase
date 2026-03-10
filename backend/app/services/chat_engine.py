from __future__ import annotations

import logging
import random

from app.core.config import get_settings
from app.models.schemas import RGBYVector

logger = logging.getLogger(__name__)

# ── Mock response pool (fallback when no API key) ──

_MOCK_RESPONSES = {
    "R": [
        "This presents significant risk exposure. The compliance framework must impose strict boundaries around data handling. Failure to adhere to these restrictions could result in criminal liability. Urgent remediation is required before the breach escalates.",
        "The danger here is material. Under section 14 of the regulatory framework, organisations must not process restricted data without explicit authorisation. The penalty structure makes this a high-priority risk item requiring immediate procedural lockdown.",
        "Critical liability detected. The system architecture must enforce prohibitive controls at every gateway. Any failure in the restriction layer exposes the organisation to breach notifications and regulatory sanctions.",
    ],
    "G": [
        "The system architecture follows a structured pattern with clear workflow stages. The framework model integrates verification steps at each checkpoint. This procedural approach ensures the process flow maintains structural integrity throughout the pipeline.",
        "Following the established pattern, the system processes data through a multi-stage workflow. Each step in the process validates against the framework model before proceeding. The architecture ensures systematic verification at every checkpoint.",
        "The structural model implements a layered pattern with clear process boundaries. Each workflow stage follows the framework architecture, ensuring systematic validation. The system design maintains procedural rigour across all integration points.",
    ],
    "B": [
        "Under section 12 of the Act, the procedure requires organisations to maintain compliance with established policy frameworks. The regulation mandates specific clause-level adherence. Each process shall follow the prescribed procedural steps as defined in the statutory instrument.",
        "The regulatory framework establishes clear policy procedures under clause 7. Organisations shall comply with the process requirements set out in the relevant sections. The Act defines specific procedural obligations that must be documented and audited.",
        "According to the applicable regulation, section 9 prescribes the compliance procedures. The policy framework shall be implemented in accordance with the statutory clauses. Each process step must reference the governing regulatory provisions.",
    ],
    "Y": [
        "There may be several approaches worth considering here. The situation presents some ambiguity, and discretionary judgement could guide the selection. Possibly a flexible strategy might accommodate the uncertain elements, though the options remain open.",
        "This could be interpreted in multiple ways. The discretionary elements suggest flexibility in approach. It might be worth exploring alternative options, as the ambiguous nature of the requirement allows for creative problem-solving.",
        "The unclear parameters here may benefit from a discretionary approach. Several options could work, and there might be room for flexible interpretation. Consider exploring the possibilities before committing to a rigid framework.",
    ],
    "balanced": [
        "The governance framework requires careful risk assessment alongside structured procedural compliance. Under the relevant regulatory sections, organisations must balance restrictive controls with operational flexibility. The system architecture shall enforce policy boundaries while allowing discretionary adaptation where appropriate.",
        "Applying the regulatory framework, this situation demands both procedural rigour and adaptive judgement. The risk parameters must be evaluated against the compliance policy, while the system architecture maintains structured workflow patterns. There may be scope for discretionary interpretation within the established boundaries.",
    ],
}

_SYSTEM_PROMPT = """You are an AI assistant whose responses are governed by the RGBY Cognition Control System — a deterministic governance layer that wraps around AI reasoning.

Your response will be independently analysed by the RGBY stack:
- Layer 1 (RGBY Sensor): Decomposes your output into 4 channels — Risk/Pressure (R), Systems/Patterns (G), Procedure/Rules (B), Behaviour/Drift (Y)
- Layer 2 (RLE): Compresses your signal into a state vector
- Layer 3 (CNVF): Validates coherence against baseline
- Layer 4 (CS-GAS): Gates output if drift exceeds thresholds
- Layer 5 (RTG): Manages state transitions
- Layer 6 (Markov): Predicts reasoning trajectory

The user's input has been classified as:
  RGBY Vector: R={user_r} G={user_g} B={user_b} Y={user_y}
  Dominant signal: {dominant}

Respond naturally, helpfully, and concisely. The governance layer scores your output independently — just provide the best response you can. Keep responses under 3 paragraphs."""


def _mock_response(user_vector: RGBYVector) -> str:
    scores = {"R": user_vector.R, "G": user_vector.G, "B": user_vector.B, "Y": user_vector.Y}
    dominant = max(scores, key=scores.get)  # type: ignore[arg-type]
    max_val = scores[dominant]
    second = sorted(scores.values(), reverse=True)[1]
    pool = _MOCK_RESPONSES["balanced"] if max_val - second <= 1 else _MOCK_RESPONSES[dominant]
    return random.choice(pool)


def _dominant_channel(v: RGBYVector) -> str:
    channels = {"risk/pressure": v.R, "systems/patterns": v.G, "procedure/rules": v.B, "behaviour/drift": v.Y}
    return max(channels, key=channels.get)  # type: ignore[arg-type]


async def generate_response(text: str, user_vector: RGBYVector) -> tuple[str, str]:
    """Returns (response_text, provider_name)."""
    settings = get_settings()
    provider = settings.llm_provider

    # Auto-detect provider from available keys
    if provider == "mock":
        if settings.anthropic_api_key:
            provider = "anthropic"
        elif settings.openai_api_key:
            provider = "openai"

    system_prompt = _SYSTEM_PROMPT.format(
        user_r=user_vector.R, user_g=user_vector.G,
        user_b=user_vector.B, user_y=user_vector.Y,
        dominant=_dominant_channel(user_vector),
    )

    if provider == "anthropic" and settings.anthropic_api_key:
        try:
            return await _call_anthropic(text, system_prompt, settings), "anthropic"
        except Exception as e:
            logger.warning("Anthropic API failed, falling back to mock: %s", e)

    if provider == "openai" and settings.openai_api_key:
        try:
            return await _call_openai(text, system_prompt, settings), "openai"
        except Exception as e:
            logger.warning("OpenAI API failed, falling back to mock: %s", e)

    return _mock_response(user_vector), "mock"


async def _call_anthropic(text: str, system_prompt: str, settings) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    message = client.messages.create(
        model=settings.llm_model if "claude" in settings.llm_model else "claude-sonnet-4-6",
        max_tokens=settings.llm_max_tokens,
        temperature=settings.llm_temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": text}],
    )
    return message.content[0].text


async def _call_openai(text: str, system_prompt: str, settings) -> str:
    import openai

    client = openai.OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.llm_model if "gpt" in settings.llm_model else "gpt-4o",
        max_tokens=settings.llm_max_tokens,
        temperature=settings.llm_temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
    )
    return response.choices[0].message.content or ""
