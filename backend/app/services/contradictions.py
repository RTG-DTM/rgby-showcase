from __future__ import annotations

import json
from pathlib import Path

from app.core.config import get_settings
from app.models.schemas import Contradiction


def _load_rules() -> list[dict]:
    path = get_settings().contradiction_patterns_file
    if not path.exists():
        return []
    return json.loads(path.read_text())


def find_contradictions(text: str) -> list[Contradiction]:
    lowered = text.lower()
    found: list[Contradiction] = []
    for rule in _load_rules():
        if all(pattern.lower() in lowered for pattern in rule["patterns"]):
            found.append(
                Contradiction(
                    id=rule["id"],
                    severity=rule["severity"],
                    type=rule["type"],
                    description=rule["description"],
                    evidence=rule["evidence"],
                )
            )
    return found
