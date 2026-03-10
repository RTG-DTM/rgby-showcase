import { Message } from '../hooks/useChat';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const { role, text, analysis, auditHash, turnNumber, timestamp, llmProvider } = message;
  const metrics = role === 'ai' && analysis ? analysis.ai : role === 'user' && analysis ? analysis.user : null;

  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`msg-bubble msg-${role}`}>
      <div className="msg-header">
        <span className="msg-role">{role === 'user' ? 'USER' : 'AI'}</span>
        <span className="msg-turn">T{turnNumber} &middot; {time}</span>
      </div>
      <div className="msg-text">{text}</div>
      {metrics && (
        <div className="msg-metrics">
          <span className="metric-pill">
            <span className="r">R{metrics.rgby.R}</span>{' '}
            <span className="g">G{metrics.rgby.G}</span>{' '}
            <span className="b">B{metrics.rgby.B}</span>{' '}
            <span className="y">Y{metrics.rgby.Y}</span>
          </span>
          <span className="metric-pill mono">RLE: {metrics.rle}</span>
          <span className="metric-pill mono">HEX: {metrics.hex}</span>
          <span className="metric-pill mono">CNVF: {metrics.cnvf.toFixed(3)}</span>
        </div>
      )}
      {(auditHash || llmProvider) && role === 'ai' && (
        <div className="msg-footer">
          {auditHash && <span className="msg-hash">SHA256: {auditHash.slice(0, 16)}...</span>}
          {llmProvider && <span className="msg-provider">{llmProvider}</span>}
        </div>
      )}
    </div>
  );
}
