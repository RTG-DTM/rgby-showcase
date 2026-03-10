export default function HeroHeader() {
  return (
    <section className="section" id="hero">
      <div className="kicker">Deterministic Control for Non-Deterministic AI</div>
      <h1>A Flight Control System<br />for AI Reasoning</h1>
      <div style={{ height: 16 }} />
      <p className="lead">
        The RGBY Cognition Control System is a six-layer closed-loop architecture that brings
        deterministic governance to probabilistic AI systems. Type a message below to see every
        layer in action — live scoring, compression, validation, and governance.
      </p>
      <div style={{ height: 8 }} />
      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
        Developed by RTG Enterprises. Patent applications: A16626GB, A16512GB.
      </p>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-val">6</div>
          <div className="stat-label">Processing Layers</div>
        </div>
        <div className="stat">
          <div className="stat-val">4</div>
          <div className="stat-label">Signal Channels</div>
        </div>
        <div className="stat">
          <div className="stat-val">2<sup style={{ fontSize: 14 }}>32</sup></div>
          <div className="stat-label">Addressable States</div>
        </div>
        <div className="stat">
          <div className="stat-val">&lt;ms</div>
          <div className="stat-label">Validation Latency</div>
        </div>
      </div>

      <div className="callout">
        <strong>The Core Problem:</strong> Large Language Models are probabilistic generators with no
        internal governance. They produce outputs without verifying coherence, detecting drift, or
        maintaining state integrity. The RGBY stack adds exactly what's missing: a deterministic
        control layer that wraps around the reasoning engine — sensing, compressing, validating,
        governing, transitioning, and predicting.
      </div>
    </section>
  );
}
