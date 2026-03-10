from __future__ import annotations

import json
import re
from pathlib import Path

from app.models.schemas import RGBYVector

# ── Negation words that flip GREEN → RED ──
_NEGATION = frozenset({"not", "no", "never", "nor", "neither", "cannot"})

# ── Common suffix patterns for stemming ──
_SUFFIX_RE = re.compile(
    r"(ments?|ness|tion|sion|ment|ised?|ized?|ises?|izes?"
    r"|ating|ting|ing|ful|less|able|ible|ive|ous|ity|ies"
    r"|ated|ally|ence|ance|ures?|ed|er|ly|al|es|s)$"
)


def _stem(word: str) -> list[str]:
    """Generate candidate stems for lexicon lookup."""
    candidates = [word]
    m = _SUFFIX_RE.search(word)
    if m and len(word) - len(m.group()) >= 3:
        base = word[:m.start()]
        candidates.append(base)
        candidates.append(base + "e")
        candidates.append(base + "y")
    return candidates


# ── Load dual lexicons ──
# Primary: 30,030-entry integer lexicon (high coverage)
# Overlay: 893-entry precise weighted lexicon (decimal weights)
_SERVICES_DIR = Path(__file__).parent
_WORD_MAP: dict[str, dict] = {}


def _load_lexicons() -> None:
    global _WORD_MAP
    if _WORD_MAP:
        return

    # 1. Load 30K integer lexicon (dict format: word → {r, g, b, y, rle, cnvf})
    path_30k = _SERVICES_DIR / "cnvf_lexicon_30k.json"
    if path_30k.exists():
        with open(path_30k) as f:
            data = json.load(f)
        for word, entry in data.items():
            w = word.lower().strip()
            _WORD_MAP[w] = {
                "r": float(entry["r"]),
                "g": float(entry["g"]),
                "b": float(entry["b"]),
                "y": float(entry["y"]),
            }

    # 2. Overlay 893-entry precise lexicon (has decimal weights, more accurate)
    path_precise = _SERVICES_DIR / "comprehensive_rgby_lexicon.json"
    if path_precise.exists():
        with open(path_precise) as f:
            entries = json.load(f)
        for entry in entries:
            w = entry["word"].lower().strip()
            _WORD_MAP[w] = {
                "r": float(entry["r"]),
                "g": float(entry["g"]),
                "b": float(entry["b"]),
                "y": float(entry["y"]),
            }


_load_lexicons()


def _lookup(word: str) -> dict | None:
    """Look up word in lexicon, trying stems if exact match fails."""
    entry = _WORD_MAP.get(word)
    if entry:
        return entry
    for stem in _stem(word):
        entry = _WORD_MAP.get(stem)
        if entry:
            return entry
    return None


def compute_rgby(text: str) -> RGBYVector:
    """Score text using the 30K + 893-entry dual lexicon.

    Follows the documented RGBY scoring approach:
    1. Sum R, G, B, Y values across ALL matched words
    2. Detect negation patterns (shall not → shift GREEN to RED)
    3. Convert totals to percentages
    4. Map percentages to 0–6 scale
    """
    words = re.findall(r"[a-zA-Z]+", text.lower())

    totals = {"R": 0.0, "G": 0.0, "B": 0.0, "Y": 0.0}
    match_count = 0
    has_negation = False

    for i, word in enumerate(words):
        if word in _NEGATION:
            has_negation = True

        entry = _lookup(word)
        if entry:
            totals["R"] += entry["r"]
            totals["G"] += entry["g"]
            totals["B"] += entry["b"]
            totals["Y"] += entry["y"]
            match_count += 1

    if match_count == 0:
        return RGBYVector(R=1, G=1, B=1, Y=1)

    # Negation detection: "shall not", "must not" → shift GREEN → RED
    if has_negation and totals["G"] > totals["R"]:
        shift = totals["G"] * 0.4
        totals["R"] += shift
        totals["G"] -= shift

    # Convert to percentages
    grand_total = sum(totals.values())
    if grand_total == 0:
        return RGBYVector(R=1, G=1, B=1, Y=1)

    pct = {ch: totals[ch] / grand_total for ch in totals}

    # Map percentages to 0–6 scale
    # Max realistic single-channel dominance is ~50-60%
    # Scale so 50% → 6, 25% (even split) → 3, 0% → 0
    scaled = {
        ch: min(6, max(0, round(pct[ch] * 12)))
        for ch in pct
    }

    return RGBYVector(**scaled)


def score_text(text: str) -> dict[str, int]:
    """Convenience function returning dict instead of RGBYVector."""
    return compute_rgby(text).model_dump()


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
