import { TurnAnalysis } from '../lib/api';

interface Props {
  analysis: TurnAnalysis | null;
  turnNumber: number;
}

const STATE_COLORS: Record<string, string> = {
  STABLE: 'var(--green)',
  MINOR_DRIFT: 'var(--yellow)',
  MAJOR_DRIFT: '#ff9800',
  CRITICAL: 'var(--red)',
};

export default function GovernanceStrip({ analysis, turnNumber }: Props) {
  const csgas = analysis?.csgas_state ?? 'AWAITING';
  const drift = analysis?.drift_from_anchor ?? 0;
  const userRgby = analysis?.user.rgby;
  const cnvf = analysis?.ai.cnvf ?? 0;
  const stateColor = STATE_COLORS[csgas] ?? 'var(--text-3)';

  return (
    <div className="state-strip">
      <div className="state-card">
        <div className="state-label">CS-GAS State</div>
        <div className="state-value">
          <span className="state-indicator" style={{ background: stateColor }} />
          <span style={{ color: stateColor }}>{csgas}</span>
        </div>
      </div>
      <div className="state-card">
        <div className="state-label">Anchor Drift</div>
        <div className="state-value" style={{ color: drift > 5 ? 'var(--red)' : drift > 3 ? 'var(--yellow)' : 'var(--green)' }}>
          {drift.toFixed(2)}
        </div>
      </div>
      <div className="state-card">
        <div className="state-label">User RGBY</div>
        <div className="state-value" style={{ fontSize: 18 }}>
          {userRgby ? (
            <>
              <span className="r">R{userRgby.R}</span>{' '}
              <span className="g">G{userRgby.G}</span>{' '}
              <span className="b">B{userRgby.B}</span>{' '}
              <span className="y">Y{userRgby.Y}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-3)' }}>--</span>
          )}
        </div>
      </div>
      <div className="state-card">
        <div className="state-label">CNVF / Turn</div>
        <div className="state-value">
          <span style={{ color: cnvf >= 0.55 ? 'var(--green)' : cnvf >= 0.30 ? 'var(--yellow)' : 'var(--red)' }}>
            {cnvf.toFixed(3)}
          </span>
          <span style={{ color: 'var(--text-3)', fontSize: 13, marginLeft: 8 }}>T{turnNumber - 1}</span>
        </div>
      </div>
    </div>
  );
}
