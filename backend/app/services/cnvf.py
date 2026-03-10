from __future__ import annotations

from typing import Iterable

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity



def _sentences(text: str) -> list[str]:
    chunks = [chunk.strip() for chunk in text.replace("\n", ". ").split(".")]
    return [chunk for chunk in chunks if len(chunk) > 20]



def compute_cnvf(text: str) -> float:
    sentences = _sentences(text)
    if len(sentences) < 2:
        return 1.0

    matrix = TfidfVectorizer(stop_words="english").fit_transform(sentences)
    sims = cosine_similarity(matrix)
    total = 0.0
    count = 0
    for i in range(len(sentences)):
        for j in range(i + 1, len(sentences)):
            total += float(sims[i, j])
            count += 1
    if count == 0:
        return 1.0
    return max(0.0, min(1.0, total / count))
