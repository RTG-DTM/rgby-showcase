export interface RGBYVector {
  R: number; G: number; B: number; Y: number;
}

export interface Contradiction {
  id: string; severity: string; description: string; evidence: string[];
}

export interface TurnMetrics {
  rgby: RGBYVector;
  rle: string;
  hex: string;
  cnvf: number;
  drift: string;
  contradictions: Contradiction[];
  key_insight: string;
}

export interface TurnAnalysis {
  user: TurnMetrics;
  ai: TurnMetrics;
  drift_from_anchor: number;
  anchor: string;
  csgas_state: string;
}

export interface ChatResponse {
  response: string;
  analysis: TurnAnalysis;
  audit_hash: string;
  turn_number: number;
  timestamp: string;
}

export async function sendChat(text: string, turnNumber: number): Promise<ChatResponse> {
  const res = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, turn_number: turnNumber }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
