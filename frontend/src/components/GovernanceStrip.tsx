import { TurnAnalysis } from '../lib/api';

interface Props {
  analysis: TurnAnalysis | null;
  turnNumber: number;
}

const STATE_COLORS: Record<string, string> = {
  STABLE: 'var(--g)',
  MINOR_DRIFT: 'var(--y)',
  MAJOR_DRIFT: 'var(--r)',
  CRITICAL: '#ff006e',
};

export default function GovernanceStrip({ analysis, turnNumber }: Props) {
  const csgas = analysis?.csgas_state ?? 'AWAITING';
  const drift = analysis?.drift_from_anchor ?? 0;
  const userRgby = analysis?.user.rgby;
  const aiRgby = analysis?.ai.rgby;
  const cnvf = analysis?.ai.cnvf ?? 0;

  return (
    <div className="state-strip">
      <div className="state-card">
        <div className="state-label">CS-GAS State</div>
        <div className="state-value" style={{ color: STATE_COLORS[csgas] ?? 'var(--muted)' }}>
          {csgas}
        </div>
      </div>
      <div className="state-card">
        <div className="state-label">Anchor Drift</div>
        <div className="state-value" style={{ color: drift > 5 ? 'var(--r)' : drift > 3 ? 'var(--y)' : 'var(--g)' }}>
          {drift.toFixed(2)}
        </div>
      </div>
      <div className="state-card">
        <div className="state-label">User RGBY</div>
        <div className="state-value">
          {userRgby ? (
            <>
              <span className="r">R{userRgby.R}</span>{' '}
              <span className="g">G{userRgby.G}</span>{' '}
              <span className="b">B{userRgby.B}</span>{' '}
              <span className="y">Y{userRgby.Y}</span>
            </>
          ) : (
            <span style={{ color: 'var(--muted)' }}>--</span>
          )}
        </div>
      </div>
      <div className="state-card">
        <div className="state-label">CNVF / Turn</div>
        <div className="state-value">
          <span style={{ color: cnvf >= 0.75 ? 'var(--g)' : cnvf >= 0.45 ? 'var(--y)' : 'var(--r)' }}>
            {cnvf.toFixed(3)}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: 15, marginLeft: 8 }}>T{turnNumber - 1}</span>
        </div>
      </div>
    </div>
  );
}
