import { TurnAnalysis } from '../lib/api';

interface Props {
  analysis: TurnAnalysis | null;
}

function RGBYBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = (value / 6) * 100;
  return (
    <div className="rgby-bar-row">
      <span className="rgby-bar-label" style={{ color }}>{label}</span>
      <div className="rgby-bar-track">
        <div className="rgby-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="rgby-bar-val">{value}</span>
    </div>
  );
}

function MetricsBlock({ title, metrics }: { title: string; metrics: TurnAnalysis['user'] }) {
  return (
    <div className="sidebar-section">
      <div className="state-label">{title}</div>
      <RGBYBar label="R" value={metrics.rgby.R} color="var(--r)" />
      <RGBYBar label="G" value={metrics.rgby.G} color="var(--g)" />
      <RGBYBar label="B" value={metrics.rgby.B} color="var(--b)" />
      <RGBYBar label="Y" value={metrics.rgby.Y} color="var(--y)" />
      <div className="sidebar-meta">
        <div><span className="meta-key">RLE</span> <span className="mono">{metrics.rle}</span></div>
        <div><span className="meta-key">HEX</span> <span className="mono">{metrics.hex}</span></div>
        <div><span className="meta-key">CNVF</span> <span className="mono">{metrics.cnvf.toFixed(3)}</span></div>
        <div><span className="meta-key">DRIFT</span> <span className="mono">{metrics.drift}</span></div>
      </div>
      {metrics.contradictions.length > 0 && (
        <div className="contradictions">
          <div className="state-label">Contradictions</div>
          {metrics.contradictions.map(c => (
            <div key={c.id} className="contradiction-item">
              <span className={`severity severity-${c.severity}`}>{c.severity}</span>
              {c.description}
            </div>
          ))}
        </div>
      )}
      <div className="key-insight">{metrics.key_insight}</div>
    </div>
  );
}

export default function AnalysisSidebar({ analysis }: Props) {
  if (!analysis) {
    return (
      <div className="analysis-sidebar">
        <div className="block-head"><div className="block-title">Analysis</div></div>
        <div className="sidebar-empty">Send a message to see RGBY analysis</div>
      </div>
    );
  }

  return (
    <div className="analysis-sidebar">
      <div className="block-head"><div className="block-title">Analysis</div></div>
      <div className="sidebar-body">
        <MetricsBlock title="User Signal" metrics={analysis.user} />
        <MetricsBlock title="AI Signal" metrics={analysis.ai} />
        <div className="sidebar-section">
          <div className="state-label">Governance</div>
          <div className="sidebar-meta">
            <div><span className="meta-key">CS-GAS</span> <span className="mono">{analysis.csgas_state}</span></div>
            <div><span className="meta-key">ANCHOR</span> <span className="mono">{analysis.anchor}</span></div>
            <div><span className="meta-key">DRIFT</span> <span className="mono">{analysis.drift_from_anchor.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
