import { useState } from 'react';
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

function MetricsBlock({ metrics }: { metrics: TurnAnalysis['user'] }) {
  return (
    <div className="sidebar-section">
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

const STATE_COLORS: Record<string, string> = {
  STABLE: 'var(--green)',
  MINOR_DRIFT: 'var(--yellow)',
  MAJOR_DRIFT: '#ff9800',
  CRITICAL: 'var(--red)',
};

export default function AnalysisSidebar({ analysis }: Props) {
  const [tab, setTab] = useState<'user' | 'ai' | 'gov'>('user');

  if (!analysis) {
    return (
      <div className="analysis-sidebar">
        <div className="block-head"><div className="block-title">Analysis</div></div>
        <div className="sidebar-empty">Send a message to see RGBY analysis</div>
      </div>
    );
  }

  const csgas = analysis.csgas_state;
  const stateColor = STATE_COLORS[csgas] ?? 'var(--text-3)';

  return (
    <div className="analysis-sidebar">
      <div className="block-head"><div className="block-title">Analysis</div></div>
      <div className="sidebar-tabs">
        <button className={`sidebar-tab ${tab === 'user' ? 'active' : ''}`} onClick={() => setTab('user')}>
          User
        </button>
        <button className={`sidebar-tab ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>
          AI
        </button>
        <button className={`sidebar-tab ${tab === 'gov' ? 'active' : ''}`} onClick={() => setTab('gov')}>
          Gov
        </button>
      </div>
      <div className="sidebar-body">
        {tab === 'user' && <MetricsBlock metrics={analysis.user} />}
        {tab === 'ai' && <MetricsBlock metrics={analysis.ai} />}
        {tab === 'gov' && (
          <div className="sidebar-section">
            <div className="gov-state">
              <span className="gov-state-dot" style={{ background: stateColor }} />
              <span className="gov-state-label" style={{ color: stateColor }}>{csgas}</span>
            </div>
            <div className="sidebar-meta">
              <div><span className="meta-key">ANCHOR</span> <span className="mono">{analysis.anchor}</span></div>
              <div><span className="meta-key">DRIFT</span> <span className="mono">{analysis.drift_from_anchor.toFixed(2)}</span></div>
              <div><span className="meta-key">USER CNVF</span> <span className="mono">{analysis.user.cnvf.toFixed(3)}</span></div>
              <div><span className="meta-key">AI CNVF</span> <span className="mono">{analysis.ai.cnvf.toFixed(3)}</span></div>
            </div>
            <div className="key-insight" style={{ marginTop: 14 }}>
              {csgas === 'STABLE' && 'Governance state is stable. Signal is within expected parameters relative to anchor.'}
              {csgas === 'MINOR_DRIFT' && 'Minor drift detected. Signal is diverging from anchor but within acceptable tolerance.'}
              {csgas === 'MAJOR_DRIFT' && 'Major drift detected. Signal has diverged significantly from anchor. Review recommended.'}
              {csgas === 'CRITICAL' && 'Critical governance alert. Signal has exceeded safe operating parameters. Immediate review required.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
