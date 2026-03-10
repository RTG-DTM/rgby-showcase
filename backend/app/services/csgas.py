from typing import Literal
import math

from app.models.schemas import RGBYVector

DriftLevel = Literal["low", "medium", "high"]


def classify_drift(cnvf: float) -> DriftLevel:
    """Classify drift level from CNVF coherence score."""
    if cnvf >= 0.55:
        return "low"
    if cnvf >= 0.30:
        return "medium"
    return "high"


CSGASState = Literal["STABLE", "MINOR_DRIFT", "MAJOR_DRIFT", "CRITICAL"]

ANCHOR = RGBYVector(R=6, G=3, B=3, Y=5)


def compute_anchor_drift(vector: RGBYVector) -> float:
    """Euclidean distance from El Capitan anchor (6R3G3B5Y)."""
    return math.sqrt(
        (vector.R - ANCHOR.R) ** 2
        + (vector.G - ANCHOR.G) ** 2
        + (vector.B - ANCHOR.B) ** 2
        + (vector.Y - ANCHOR.Y) ** 2
    )


def compute_combined_drift(
    user: RGBYVector,
    ai: RGBYVector,
    user_confidence: float = 1.0,
    ai_confidence: float = 1.0,
) -> float:
    """Combined drift: weighted average of user and AI distance from anchor.

    When signal confidence is low (greetings, filler text), drift is dampened
    so governance doesn't over-react to text with insufficient signal.
    """
    user_drift = compute_anchor_drift(user)
    ai_drift = compute_anchor_drift(ai)
    raw = (user_drift + ai_drift) / 2
    # Dampen drift by average confidence — low-signal text → drift pushed toward 0
    avg_confidence = (user_confidence + ai_confidence) / 2
    return raw * avg_confidence


def determine_csgas_state(cnvf: float, drift_from_anchor: float) -> CSGASState:
    """Determine CS-GAS governance state from CNVF coherence and anchor drift.

    Uses a balanced matrix:
      STABLE:      good coherence AND close to anchor
      MINOR_DRIFT: moderate coherence OR moderate drift
      MAJOR_DRIFT: low coherence OR large drift
      CRITICAL:    very low coherence AND very large drift
    """
    if cnvf >= 0.50 and drift_from_anchor < 4.0:
        return "STABLE"
    if cnvf >= 0.30 and drift_from_anchor < 6.0:
        return "MINOR_DRIFT"
    if cnvf >= 0.15 or drift_from_anchor < 8.0:
        return "MAJOR_DRIFT"
    return "CRITICAL"
