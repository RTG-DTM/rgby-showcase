from __future__ import annotations

import re
from collections import Counter

from app.models.schemas import RGBYVector

LEXICON = {
    "R": [
        r"\brisk\b", r"\bdanger\b", r"\bbreach\b", r"\bfail(?:ure|ing)?\b",
        r"\bcriminal\b", r"\bliability\b", r"\bmust\b", r"\burgent\b",
    ],
    "G": [
        r"\bsystem\b", r"\bstructure\b", r"\bpattern\b", r"\bframework\b",
        r"\bmodel\b", r"\barchitecture\b", r"\bworkflow\b",
    ],
    "B": [
        r"\bsection\b", r"\bclause\b", r"\bprocedure\b", r"\bprocess\b",
        r"\bpolicy\b", r"\bregulation\b", r"\bact\b", r"\bshall\b",
    ],
    "Y": [
        r"\bmay\b", r"\bcan\b", r"\bmight\b", r"\bunclear\b",
        r"\bambiguous\b", r"\bdiscretion(?:ary)?\b", r"\bpossibly\b",
    ],
}


def _score_channel(text: str, patterns: list[str]) -> int:
    count = 0
    for pattern in patterns:
        count += len(re.findall(pattern, text, flags=re.IGNORECASE))
    return count


def compute_rgby(text: str) -> RGBYVector:
    raw = {channel: _score_channel(text, patterns) for channel, patterns in LEXICON.items()}
    max_count = max(raw.values()) if raw else 1
    if max_count == 0:
        return RGBYVector(R=1, G=1, B=1, Y=0)

    scaled = {
        key: min(6, max(0, round((value / max_count) * 6)))
        for key, value in raw.items()
    }

    # small stabiliser: if legal/compliance text, keep B at least 2 when sections/clauses are present
    if re.search(r"\b(section|clause|regulation|act|article)\b", text, flags=re.IGNORECASE):
        scaled["B"] = max(scaled["B"], 2)

    return RGBYVector(**scaled)


def key_insight_for_vector(vector: RGBYVector) -> str:
    d = vector.model_dump()
    max_val = max(d.values())
    dominant_channels = [k for k, v in d.items() if v == max_val]
    channel_names = {
        "R": "risk/pressure",
        "G": "system/pattern",
        "B": "procedure/scope",
        "Y": "behaviour/discretion",
    }
    readable = ", ".join(channel_names[ch] for ch in dominant_channels)
    return f"Dominant signal: {readable}. This output should be reviewed through that governance lens."
