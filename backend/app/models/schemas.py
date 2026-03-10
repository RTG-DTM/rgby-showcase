from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RGBYVector(BaseModel):
    R: int = Field(ge=0, le=6)
    G: int = Field(ge=0, le=6)
    B: int = Field(ge=0, le=6)
    Y: int = Field(ge=0, le=6)


class Contradiction(BaseModel):
    id: str
    severity: Literal["low", "medium", "high"]
    type: str
    description: str
    evidence: list[str] = []


class AnalyzeResponse(BaseModel):
    filename: str
    rgbY: RGBYVector
    rle: str
    cnvf: float = Field(ge=0.0, le=1.0)
    drift: Literal["low", "medium", "high"]
    contradictions: list[Contradiction] = []
    key_insight: str
    audit_hash: str
    processed_at: datetime


class ExportPayload(BaseModel):
    title: str = "RGX Governance Export"
    source_name: str = "uploaded-document"
    results: AnalyzeResponse


# --- Chat models ---

class ChatRequest(BaseModel):
    text: str
    turn_number: int = 1
    conversation_id: str = ""


class TurnMetrics(BaseModel):
    rgby: RGBYVector
    rle: str
    hex: str
    cnvf: float
    drift: Literal["low", "medium", "high"]
    contradictions: list[Contradiction] = []
    key_insight: str


class TurnAnalysis(BaseModel):
    user: TurnMetrics
    ai: TurnMetrics
    drift_from_anchor: float
    anchor: str
    csgas_state: str


class ChatResponse(BaseModel):
    response: str
    analysis: TurnAnalysis
    audit_hash: str
    turn_number: int
    timestamp: datetime
    governance_action: str = "PASS"
    llm_provider: str = "mock"
