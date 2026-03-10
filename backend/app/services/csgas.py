from typing import Literal
import math

from app.models.schemas import RGBYVector

DriftLevel = Literal["low", "medium", "high"]


def classify_drift(cnvf: float) -> DriftLevel:
    if cnvf >= 0.75:
        return "low"
    if cnvf >= 0.45:
        return "medium"
    return "high"


CSGASState = Literal["STABLE", "MINOR_DRIFT", "MAJOR_DRIFT", "CRITICAL"]

ANCHOR = RGBYVector(R=6, G=3, B=3, Y=5)


def compute_anchor_drift(vector: RGBYVector) -> float:
    return math.sqrt(
        (vector.R - ANCHOR.R) ** 2
        + (vector.G - ANCHOR.G) ** 2
        + (vector.B - ANCHOR.B) ** 2
        + (vector.Y - ANCHOR.Y) ** 2
    )


def determine_csgas_state(cnvf: float, drift_from_anchor: float) -> CSGASState:
    if cnvf >= 0.75 and drift_from_anchor < 3.0:
        return "STABLE"
    elif cnvf >= 0.45 and drift_from_anchor < 5.0:
        return "MINOR_DRIFT"
    elif cnvf >= 0.25:
        return "MAJOR_DRIFT"
    return "CRITICAL"
