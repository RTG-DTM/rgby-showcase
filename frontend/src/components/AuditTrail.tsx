import { AuditEntry } from '../hooks/useChat';

interface Props {
  entries: AuditEntry[];
}

export default function AuditTrail({ entries }: Props) {
  return (
    <div className="audit-trail">
      <div className="block-head">
        <div className="block-title">Audit Trail</div>
        {entries.length > 0 && (
          <span className="block-badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>
      <div className="audit-body">
        {entries.length === 0 ? (
          <div className="audit-empty mono">Awaiting interactions...</div>
        ) : (
          entries.map((e, i) => {
            const time = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return (
              <div key={i} className="audit-entry">
                <span className="audit-turn">T{e.turn}</span>
                <span className={`audit-csgas audit-csgas-${e.csgas}`}>{e.csgas}</span>
                <span className="audit-hash mono">{e.hash.slice(0, 24)}...</span>
                <span className="audit-time">{time}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
