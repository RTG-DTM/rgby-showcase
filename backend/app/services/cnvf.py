from __future__ import annotations

import math
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _sentences(text: str) -> list[str]:
    """Split text into sentence-like chunks."""
    chunks = re.split(r'[.!?\n]+', text)
    return [c.strip() for c in chunks if len(c.strip()) > 10]


def compute_cnvf(text: str) -> float:
    """Causal Narrative Validity Function.

    Composite coherence score (0.0–1.0) combining:
      1. Lexical coherence — TF-IDF cosine similarity between sentences
      2. Vocabulary richness — unique word ratio
      3. Content density — ratio of substantive words to total
      4. Structural quality — sentence count and length balance

    Higher = more coherent, well-formed governance text.
    """
    words = re.findall(r'[a-zA-Z]{2,}', text.lower())
    total_words = len(words)

    if total_words < 3:
        return 0.3

    # ── Component 1: Vocabulary richness (0.0–1.0) ──
    unique_ratio = len(set(words)) / total_words
    richness = min(1.0, unique_ratio * 1.2)  # slight boost

    # ── Component 2: Content density (0.0–1.0) ──
    # Words >= 4 chars are likely content words
    content_words = [w for w in words if len(w) >= 4]
    density = len(content_words) / total_words if total_words > 0 else 0

    # ── Component 3: Structural quality (0.0–1.0) ──
    sentences = _sentences(text)
    n_sent = len(sentences)
    if n_sent == 0:
        structure = 0.3
    elif n_sent == 1:
        # Single sentence — shorter texts get moderate score
        avg_len = total_words
        structure = min(1.0, avg_len / 15)  # 15+ words → 1.0
    else:
        # Multiple sentences — check length balance
        sent_lens = [len(re.findall(r'[a-zA-Z]+', s)) for s in sentences]
        avg_len = sum(sent_lens) / n_sent
        # Coefficient of variation — lower is more balanced
        if avg_len > 0:
            std = math.sqrt(sum((l - avg_len) ** 2 for l in sent_lens) / n_sent)
            cv = std / avg_len
            structure = max(0.3, min(1.0, 1.0 - cv * 0.5))
        else:
            structure = 0.3

    # ── Component 4: Lexical coherence via TF-IDF (0.0–1.0) ──
    if n_sent >= 2:
        try:
            matrix = TfidfVectorizer(
                stop_words="english", min_df=1, max_features=500,
            ).fit_transform(sentences)
            sims = cosine_similarity(matrix)
            # Adjacent pairs
            adj_total = sum(float(sims[i, i + 1]) for i in range(n_sent - 1))
            adj_avg = adj_total / (n_sent - 1)
            coherence = min(1.0, adj_avg + 0.3)  # baseline boost
        except ValueError:
            coherence = 0.5
    else:
        coherence = 0.6  # single sentence gets moderate coherence

    # ── Weighted composite ──
    cnvf = (
        richness * 0.20
        + density * 0.25
        + structure * 0.25
        + coherence * 0.30
    )

    return max(0.0, min(1.0, cnvf))
