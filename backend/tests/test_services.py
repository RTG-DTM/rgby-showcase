from app.services.cnvf import compute_cnvf
from app.services.csgas import classify_drift
from app.services.rgby import compute_rgby
from app.services.rle import encode_rle


def test_rgby_returns_bounded_vector():
    vector = compute_rgby("The system must follow procedure. There is risk and ambiguity.")
    for value in vector.model_dump().values():
        assert 0 <= value <= 6


def test_rle_format():
    vector = compute_rgby("risk procedure")
    assert encode_rle(vector).endswith("Y")


def test_cnvf_range():
    value = compute_cnvf("Sentence one about governance. Sentence two about governance.")
    assert 0.0 <= value <= 1.0


def test_drift_classifier():
    assert classify_drift(0.8) == "low"
    assert classify_drift(0.5) == "medium"
    assert classify_drift(0.2) == "high"
