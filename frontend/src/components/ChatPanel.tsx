import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../hooks/useChat';
import MessageBubble from './MessageBubble';

interface Props {
  messages: Message[];
  isProcessing: boolean;
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, isProcessing, onSend }: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isProcessing, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-panel">
      <div className="block-head">
        <div className="block-title">Chat Interface</div>
        {messages.length > 0 && (
          <span className="block-badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            {Math.ceil(messages.length / 2)} {Math.ceil(messages.length / 2) === 1 ? 'turn' : 'turns'}
          </span>
        )}
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <span className="r">R</span><span className="g">G</span><span className="b">B</span><span className="y">Y</span>
            </div>
            Type a message to begin RGBY governance analysis.
            <br />
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
              Each turn is scored, compressed, fingerprinted, and governed in real time.
            </span>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isProcessing && (
          <div className="chat-processing">
            <span className="pulse-dot" /> Processing through RGBY governance stack...
          </div>
        )}
      </div>
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Enter text for RGBY analysis... (Shift+Enter for new line)"
          disabled={isProcessing}
          rows={1}
        />
        <button type="submit" disabled={isProcessing || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
