import { useState, useCallback } from 'react';
import { sendChat, ChatResponse, TurnAnalysis } from '../lib/api';

export interface Message {
  role: 'user' | 'ai';
  text: string;
  analysis?: TurnAnalysis;
  auditHash?: string;
  turnNumber: number;
  timestamp: string;
  llmProvider?: string;
}

export interface TrajectoryPoint {
  turn: number;
  user: { r: number; g: number; b: number; y: number };
  ai: { r: number; g: number; b: number; y: number };
  driftFromAnchor: number;
  csgas: string;
}

export interface AuditEntry {
  turn: number;
  hash: string;
  csgas: string;
  timestamp: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<TurnAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);

    const userMsg: Message = {
      role: 'user', text, turnNumber,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res: ChatResponse = await sendChat(text, turnNumber);

      const aiMsg: Message = {
        role: 'ai',
        text: res.response,
        analysis: res.analysis,
        auditHash: res.audit_hash,
        turnNumber,
        timestamp: res.timestamp,
        llmProvider: res.llm_provider,
      };
      setMessages(prev => [...prev, aiMsg]);
      setCurrentAnalysis(res.analysis);

      const point: TrajectoryPoint = {
        turn: turnNumber,
        user: {
          r: res.analysis.user.rgby.R,
          g: res.analysis.user.rgby.G,
          b: res.analysis.user.rgby.B,
          y: res.analysis.user.rgby.Y,
        },
        ai: {
          r: res.analysis.ai.rgby.R,
          g: res.analysis.ai.rgby.G,
          b: res.analysis.ai.rgby.B,
          y: res.analysis.ai.rgby.Y,
        },
        driftFromAnchor: res.analysis.drift_from_anchor,
        csgas: res.analysis.csgas_state,
      };
      setTrajectory(prev => [...prev, point]);

      setAuditLog(prev => [...prev, {
        turn: turnNumber,
        hash: res.audit_hash,
        csgas: res.analysis.csgas_state,
        timestamp: res.timestamp,
      }]);

      setTurnNumber(n => n + 1);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, turnNumber]);

  return { messages, trajectory, auditLog, currentAnalysis, isProcessing, turnNumber, send };
}
