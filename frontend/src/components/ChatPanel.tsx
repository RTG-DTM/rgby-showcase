import { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="chat-panel">
      <div className="block-head">
        <div className="block-title">Chat Interface</div>
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            Type a message to begin RGBY analysis. Each turn is scored, fingerprinted, and governed.
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isProcessing && (
          <div className="chat-processing">
            <span className="pulse-dot" /> Analysing cognitive signal...
          </div>
        )}
      </div>
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter text for RGBY analysis..."
          disabled={isProcessing}
        />
        <button type="submit" disabled={isProcessing || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
