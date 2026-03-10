import { AuditEntry } from '../hooks/useChat';

interface Props {
  entries: AuditEntry[];
}

export default function AuditTrail({ entries }: Props) {
  return (
    <div className="audit-trail">
      <div className="block-head"><div className="block-title">Audit Trail</div></div>
      <div className="audit-body">
        {entries.length === 0 ? (
          <div className="audit-empty mono">Awaiting interactions...</div>
        ) : (
          entries.map((e, i) => (
            <div key={i} className="audit-entry">
              <span className="audit-turn">T{e.turn}</span>
              <span className="audit-csgas">{e.csgas}</span>
              <span className="audit-hash mono">{e.hash.slice(0, 20)}...</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
