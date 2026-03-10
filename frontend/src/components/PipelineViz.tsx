import { useState } from 'react';

const LAYERS = [
  {
    label: 'Layer 1', name: 'RGBY Sensor', role: 'Signal Decomposition', color: 'var(--red)',
    desc: 'Decomposes input into 4 orthogonal channels: Risk/Pressure (R), Patterns/Systems (G), Procedure/Rules (B), Behaviour/Drift (Y). Each channel scored 0\u20136. The combination creates a 4D point in cognitive space.',
    equiv: 'Radar + INS + IR seeker (missile) \u00b7 Price + volume + flow + sentiment (HFT) \u00b7 Altimeter + airspeed + attitude (aviation)',
  },
  {
    label: 'Layer 2', name: 'RLE Encoder', role: 'State Compression', color: 'var(--green)',
    desc: 'Raw RGBY scores compressed into compact notation: 4R3G2B5Y. Advanced hex encoding produces 8-digit fingerprints with 4.29 billion unique states. 62\u201387% compression ratio.',
    equiv: 'Kalman filter output (missile) \u00b7 Order-book compression (HFT) \u00b7 Air data computer (aviation)',
  },
  {
    label: 'Layer 3', name: 'CNVF Validator', role: 'Integrity Check', color: 'var(--blue)',
    desc: 'Checks state coherence using cosine similarity against baseline. Detects drift before it causes failure. Monitors dominance, dependency, redundancy, and temporal ratios.',
    equiv: 'Sensor fusion confidence (missile) \u00b7 Risk model validation (HFT) \u00b7 Instrument cross-check (aviation)',
  },
  {
    label: 'Layer 4', name: 'CS-GAS Governor', role: 'Safety Controller', color: 'var(--yellow)',
    desc: 'Cognition Security \u2013 Governance Assist System. Evaluates drift magnitude, classifies severity, triggers proportional intervention: gate output, escalate risk, or block execution entirely.',
    equiv: 'Engage/disengage/abort logic (missile) \u00b7 Circuit breakers (HFT) \u00b7 Flight envelope protection (aviation)',
  },
  {
    label: 'Layer 5', name: 'RTG Engine', role: 'State Transition', color: 'var(--accent)',
    desc: 'Reality \u2192 Transition \u2192 Governance. The execution authority that computes state_t+1 from state_t given validated RGBY input, CNVF clearance, and CS-GAS approval.',
    equiv: 'Guidance computer (missile) \u00b7 Order execution engine (HFT) \u00b7 Autopilot servo (aviation)',
  },
  {
    label: 'Layer 6', name: 'Markov Predictor', role: 'Trajectory Forecast', color: '#a371f7',
    desc: 'Forecasts future states using probabilistic transition models and entropy analysis. Predicted state feeds back to Layer 1 as new baseline \u2014 closing the control loop.',
    equiv: 'Proportional navigation (missile) \u00b7 Bayesian price forecast (HFT) \u00b7 FMS trajectory prediction (aviation)',
  },
];

export default function PipelineViz() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <div className="pipeline">
        {LAYERS.map((layer, i) => (
          <div key={i}>
            {i > 0 && <span className="pipe-arrow">\u2192</span>}
            <div
              className={`pipe-node${active === i ? ' active' : ''}`}
              onClick={() => setActive(active === i ? null : i)}
            >
              <div className="pipe-label">{layer.label}</div>
              <div className="pipe-name" style={{ color: layer.color }}>{layer.name}</div>
              <div className="pipe-role">{layer.role}</div>
            </div>
          </div>
        ))}
      </div>

      {active !== null && (
        <div className="card pipe-detail">
          <h3 style={{ color: LAYERS[active].color, marginBottom: 8 }}>{LAYERS[active].name}</h3>
          <p>{LAYERS[active].desc}</p>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-2)' }}>
            <strong style={{ color: 'var(--text-0)' }}>Cross-domain:</strong> {LAYERS[active].equiv}
          </p>
        </div>
      )}
    </div>
  );
}
