const ROWS = [
  { label: 'State Tracking', without: 'None \u2014 each inference is stateless', with: 'Continuous state vector with full history' },
  { label: 'Drift Detection', without: 'Post-hoc only (human review, RLHF)', with: 'Real-time CNVF ratio monitoring' },
  { label: 'Governance', without: 'Constitutional AI, guardrails \u2014 soft constraints', with: 'CS-GAS deterministic gating \u2014 hard constraints' },
  { label: 'Explainability', without: 'Attention maps, chain-of-thought \u2014 partial', with: 'Full RGBY state trace per reasoning step' },
  { label: 'Audit Trail', without: 'Log files at best', with: 'Timestamped state transitions, CNVF fingerprints' },
  { label: 'Prediction', without: 'Next-token probability \u2014 one step ahead', with: 'Markov trajectory forecast over time horizon' },
  { label: 'Architecture', without: 'Open-loop text prediction', with: 'Closed-loop cognition control' },
];

export default function ComparisonTable() {
  return (
    <div className="compare-wrap">
      <div className="compare-row compare-header">
        <div className="compare-cell label"></div>
        <div className="compare-cell">Current AI Systems</div>
        <div className="compare-cell">With RGBY Control Layer</div>
      </div>
      {ROWS.map(row => (
        <div key={row.label} className="compare-row">
          <div className="compare-cell label">{row.label}</div>
          <div className="compare-cell" style={{ color: 'var(--text-3)' }}>{row.without}</div>
          <div className="compare-cell" style={{ color: 'var(--green)' }}>{row.with}</div>
        </div>
      ))}
    </div>
  );
}
