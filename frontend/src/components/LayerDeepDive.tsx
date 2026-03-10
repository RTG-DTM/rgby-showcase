import { useState } from 'react';

const LAYERS = [
  {
    id: 'rgby',
    icon: 'R', iconBg: 'var(--red-dim)', iconColor: 'var(--red)',
    title: 'RGBY \u2014 4-Channel Signal Sensor',
    sub: 'Decomposes any input into four orthogonal cognitive dimensions',
    body: (
      <>
        <p style={{ marginBottom: 14 }}>Every signal is decomposed into four independent channels. These channels capture fundamentally different types of information, the way RGB captures light.</p>
        <div className="g4" style={{ marginBottom: 14 }}>
          {[
            { ch: 'R', name: 'Risk / Pressure', desc: 'Urgency, threat, escalation, stakes.', color: 'var(--red)' },
            { ch: 'G', name: 'Patterns / Systems', desc: 'Architecture, models, structure.', color: 'var(--green)' },
            { ch: 'B', name: 'Procedure / Rules', desc: 'Standards, compliance, data.', color: 'var(--blue)' },
            { ch: 'Y', name: 'Behaviour / Drift', desc: 'Emotion, ambiguity, errors.', color: 'var(--yellow)' },
          ].map(c => (
            <div key={c.ch} className="card" style={{ borderTop: `3px solid ${c.color}`, padding: 14 }}>
              <div style={{ font: '700 20px var(--mono)', color: c.color, marginBottom: 4 }}>{c.ch}</div>
              <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 13 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          <strong style={{ color: 'var(--text-0)' }}>Scoring:</strong> Each channel scored 0\u20136. Scale: 0 = absent, 1\u20132 = low, 3\u20134 = medium, 5\u20136 = high.
        </p>
      </>
    ),
  },
  {
    id: 'rle',
    icon: '\u27E9', iconBg: 'var(--green-dim)', iconColor: 'var(--green)',
    title: 'RLE \u2014 State Vector Compression',
    sub: 'Compresses raw RGBY readings into a compact, transmissible state vector',
    body: (
      <>
        <div className="card" style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 18, padding: 16, marginBottom: 14 }}>
          <span style={{ color: 'var(--text-2)' }}>Raw:</span>{' '}
          <span className="r">RRRR</span><span className="g">GGG</span><span className="b">BB</span><span className="y">YYYYY</span>
          <span style={{ color: 'var(--text-3)', margin: '0 14px' }}>\u2192</span>
          <span style={{ color: 'var(--text-2)' }}>RLE:</span>{' '}
          <span className="r">4R</span><span className="g">3G</span><span className="b">2B</span><span className="y">5Y</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          <strong style={{ color: 'var(--text-0)' }}>Hex encoding:</strong> 62\u201387% compression. 4-channel RGBY \u2192 8-digit hex fingerprint. 2\u00B3\u00B2 = 4.29 billion unique addressable states.
        </p>
      </>
    ),
  },
  {
    id: 'cnvf',
    icon: '\u2713', iconBg: 'var(--blue-dim)', iconColor: 'var(--blue)',
    title: 'CNVF \u2014 Integrity Validator',
    sub: 'Verifies state coherence and detects drift from expected baselines',
    body: (
      <p>CNVF compares the current state vector against expected baselines using cosine similarity. Threshold breach flags drift. The system detects instability before it reaches critical levels, enabling pre-emptive intervention.</p>
    ),
  },
  {
    id: 'csgas',
    icon: '\u26A1', iconBg: 'var(--yellow-dim)', iconColor: 'var(--yellow)',
    title: 'CS-GAS \u2014 Governance Safety Controller',
    sub: 'Prevents dangerous state transitions',
    body: (
      <>
        <p style={{ marginBottom: 12 }}>CS-GAS sits between validation and execution. It doesn't compute state \u2014 it prevents dangerous transitions. Four escalation levels:</p>
        <div className="g4">
          {[
            { state: 'STABLE', color: 'var(--green)', desc: 'All clear' },
            { state: 'MINOR_DRIFT', color: 'var(--yellow)', desc: 'Rewrite advised' },
            { state: 'MAJOR_DRIFT', color: 'var(--red)', desc: 'Output gated' },
            { state: 'CRITICAL', color: '#ff006e', desc: 'Execution blocked' },
          ].map(s => (
            <div key={s.state} className="card" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ font: '700 12px var(--mono)', color: s.color, letterSpacing: 1 }}>{s.state}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'rtg',
    icon: '\u27F2', iconBg: 'var(--accent-dim)', iconColor: 'var(--accent)',
    title: 'RTG \u2014 State Transition Engine',
    sub: 'Reality \u2192 Transition \u2192 Governance: executes validated state changes',
    body: (
      <div className="card" style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 15, padding: 16 }}>
        <span style={{ color: 'var(--text-1)' }}>state</span><sub>t</sub>
        <span style={{ color: 'var(--text-3)', margin: '0 12px' }}>\u2192</span>
        <span style={{ color: 'var(--accent)' }}>f(RGBY, CNVF, CS-GAS)</span>
        <span style={{ color: 'var(--text-3)', margin: '0 12px' }}>\u2192</span>
        <span style={{ color: 'var(--text-1)' }}>state</span><sub>t+1</sub>
      </div>
    ),
  },
  {
    id: 'markov',
    icon: '\u221E', iconBg: 'rgba(163,113,247,0.12)', iconColor: '#a371f7',
    title: 'Markov / Entropy \u2014 Predictive Layer',
    sub: 'Forecasts future states, closes the feedback loop',
    body: (
      <p>Uses Markov state models and entropy analysis to forecast where the system is heading. Predicted state feeds back to Layer 1 as the new baseline \u2014 closing the loop. This is the same architecture used in PID controllers, Kalman filters, and autopilot systems.</p>
    ),
  },
];

export default function LayerDeepDive() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['rgby']));

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {LAYERS.map(layer => (
        <div key={layer.id} className={`layer-card${openIds.has(layer.id) ? ' open' : ''}`}>
          <div className="layer-header" onClick={() => toggle(layer.id)}>
            <div className="layer-icon" style={{ background: layer.iconBg, color: layer.iconColor }}>{layer.icon}</div>
            <div>
              <h3>{layer.title}</h3>
              <div className="layer-sub">{layer.sub}</div>
            </div>
            <span className="layer-toggle">\u25BC</span>
          </div>
          <div className="layer-body">{layer.body}</div>
        </div>
      ))}
    </div>
  );
}
