from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import AnalyzeResponse, ChatRequest, ChatResponse, TurnAnalysis, TurnMetrics
from app.services.audit import payload_hash
from app.services.chat_engine import generate_response
from app.services.cnvf import compute_cnvf
from app.services.contradictions import find_contradictions
from app.services.csgas import classify_drift, compute_anchor_drift, compute_combined_drift, determine_csgas_state
from app.services.hex_signature import generate_hex_signature
from app.services.rgby import compute_rgby, key_insight_for_vector
from app.services.rle import encode_rle

router = APIRouter()


@router.get("/healthz")
@router.get("/health")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)) -> AnalyzeResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="missing filename")
    raw = await file.read()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="file must be utf-8 text") from exc

    vector, _ = compute_rgby(text)
    rle = encode_rle(vector)
    cnvf = compute_cnvf(text)
    contradictions = find_contradictions(text)
    key_insight = key_insight_for_vector(vector)
    audit_h = payload_hash({"text": text[:200], "vector": vector.model_dump()})
    return AnalyzeResponse(
        filename=file.filename,
        rgbY=vector,
        rle=rle,
        cnvf=cnvf,
        drift=classify_drift(cnvf),
        contradictions=contradictions,
        key_insight=key_insight,
        audit_hash=audit_h,
        processed_at=datetime.now(timezone.utc),
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    text = request.text

    user_vector, user_confidence = compute_rgby(text)
    user_rle = encode_rle(user_vector)
    user_hex = generate_hex_signature(user_vector)
    user_cnvf = compute_cnvf(text)
    user_drift = classify_drift(user_cnvf)
    user_contradictions = find_contradictions(text)
    user_insight = key_insight_for_vector(user_vector)

    ai_text, llm_provider = await generate_response(text, user_vector)

    ai_vector, ai_confidence = compute_rgby(ai_text)
    ai_rle = encode_rle(ai_vector)
    ai_hex = generate_hex_signature(ai_vector)
    ai_cnvf = compute_cnvf(ai_text)
    ai_drift = classify_drift(ai_cnvf)
    ai_insight = key_insight_for_vector(ai_vector)

    # Combined drift uses both user + AI distance from anchor
    # Confidence dampens drift for low-signal text (greetings, filler)
    drift_from_anchor = compute_combined_drift(
        user_vector, ai_vector, user_confidence, ai_confidence
    )
    # CNVF for governance uses the AI response (longer, more measurable)
    combined_cnvf = (user_cnvf + ai_cnvf) / 2
    csgas_state = determine_csgas_state(combined_cnvf, drift_from_anchor)

    audit_h = payload_hash({
        "turn": request.turn_number,
        "user_text": text[:200],
        "user_rgby": user_vector.model_dump(),
        "ai_rgby": ai_vector.model_dump(),
        "csgas": csgas_state,
    })

    return ChatResponse(
        response=ai_text,
        analysis=TurnAnalysis(
            user=TurnMetrics(
                rgby=user_vector, rle=user_rle, hex=user_hex,
                cnvf=user_cnvf, drift=user_drift,
                contradictions=user_contradictions, key_insight=user_insight,
            ),
            ai=TurnMetrics(
                rgby=ai_vector, rle=ai_rle, hex=ai_hex,
                cnvf=ai_cnvf, drift=ai_drift,
                contradictions=[], key_insight=ai_insight,
            ),
            drift_from_anchor=round(drift_from_anchor, 3),
            anchor="6R3G3B5Y",
            csgas_state=csgas_state,
        ),
        audit_hash=audit_h,
        turn_number=request.turn_number,
        timestamp=datetime.now(timezone.utc),
        governance_action="FLAGGED" if csgas_state in ("MAJOR_DRIFT", "CRITICAL") else "PASS",
        llm_provider=llm_provider,
    )
