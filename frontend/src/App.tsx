import { useEffect } from 'react';
import { useChat } from './hooks/useChat';
import HeroHeader from './components/HeroHeader';
import PipelineViz from './components/PipelineViz';
import GovernanceStrip from './components/GovernanceStrip';
import ChatPanel from './components/ChatPanel';
import AnalysisSidebar from './components/AnalysisSidebar';
import HexSpaceVisualization from './components/HexSpaceVisualization';
import AuditTrail from './components/AuditTrail';
import LayerDeepDive from './components/LayerDeepDive';
import ComparisonTable from './components/ComparisonTable';

const NAV_ITEMS = [
  { id: 'hero', label: 'Overview' },
  { id: 'pipeline', label: 'Architecture' },
  { id: 'live', label: 'Live Demo' },
  { id: 'layers', label: 'Layer Deep Dive' },
  { id: 'comparison', label: 'Why This Matters' },
];

export default function App() {
  const { messages, trajectory, auditLog, currentAnalysis, isProcessing, turnNumber, send } = useChat();

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Sticky topbar */}
      <nav className="topbar">
        <div className="topbar-inner">
          <a className="logo" href="#">
            <div className="logo-dots">
              <span className="logo-dot rd" />
              <span className="logo-dot gn" />
              <span className="logo-dot bl" />
              <span className="logo-dot yw" />
            </div>
            <span className="logo-text">
              RGBY<span className="logo-sub">Cognition Control System</span>
            </span>
          </a>
          <div className="nav-links">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className="nav-link" onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="wrap">
        {/* Hero */}
        <HeroHeader />

        {/* Pipeline */}
        <section className="section reveal" id="pipeline">
          <div className="kicker">System Architecture</div>
          <h2>The Six-Layer Pipeline</h2>
          <p className="lead">
            Signal flows through six distinct processing stages. Each layer has a single
            responsibility. Together they form a closed-loop cognition controller.
          </p>
          <PipelineViz />
          <div className="callout">
            <strong>Closed Loop:</strong> The output of Layer 6 feeds back into Layer 1. Predicted
            state becomes the baseline for the next sensing cycle. Drift between predicted and
            actual triggers CS-GAS intervention.
          </div>
        </section>

        {/* Live Demo */}
        <section className="section" id="live">
          <div className="kicker reveal">Live Governance Demo</div>
          <h2 className="reveal">Chat with RGBY Governance</h2>
          <p className="lead reveal">
            Every message you send is scored, compressed, validated, and governed in real time.
            Watch the full protocol stack operate on live AI responses.
          </p>
          <div style={{ height: 20 }} />

          <GovernanceStrip analysis={currentAnalysis} turnNumber={turnNumber} />

          <div className="main-grid">
            <ChatPanel messages={messages} isProcessing={isProcessing} onSend={send} />
            <AnalysisSidebar analysis={currentAnalysis} />
          </div>

          <div className="viz-section">
            <div className="block">
              <div className="block-head">
                <div className="block-title">4D RGBY Vector Space</div>
              </div>
              <div className="viz-container">
                <HexSpaceVisualization trajectory={trajectory} />
              </div>
            </div>
          </div>

          <AuditTrail entries={auditLog} />
        </section>

        {/* Layer Deep Dive */}
        <section className="section reveal" id="layers">
          <div className="kicker">Layer Deep Dive</div>
          <h2>Each Layer in Detail</h2>
          <p className="lead">Click any layer to expand its specification and cross-domain mapping.</p>
          <div style={{ height: 20 }} />
          <LayerDeepDive />
        </section>

        {/* Comparison */}
        <section className="section reveal" id="comparison">
          <div className="kicker">Strategic Positioning</div>
          <h2>Why This Architecture Matters Now</h2>
          <p className="lead">
            AI systems are being deployed in safety-critical contexts without the governance
            infrastructure that every other safety-critical engineering domain takes for granted.
          </p>
          <div style={{ height: 20 }} />
          <ComparisonTable />

          <div style={{ height: 28 }} />
          <div className="g3">
            <div className="card" style={{ borderTop: '3px solid var(--red)' }}>
              <h3>For AI Safety Researchers</h3>
              <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.7 }}>
                Alignment-as-architecture, not alignment-as-training. The control layer is
                deterministic, inspectable, and provable.
              </p>
            </div>
            <div className="card" style={{ borderTop: '3px solid var(--green)' }}>
              <h3>For Defence / Critical Infrastructure</h3>
              <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.7 }}>
                The architecture is already proven in your domain. Sensor arrays, Kalman filters,
                safety interlocks — RGBY applies the same engineering to AI cognition.
              </p>
            </div>
            <div className="card" style={{ borderTop: '3px solid var(--blue)' }}>
              <h3>For Regulators</h3>
              <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.7 }}>
                Explainability, audit trails, and drift monitoring as native architectural
                features — not bolted-on compliance.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-dots">
              <span className="logo-dot rd" />
              <span className="logo-dot gn" />
              <span className="logo-dot bl" />
              <span className="logo-dot yw" />
            </div>
            <div>
              <div className="footer-title">RGBY Cognition Control System</div>
              <div className="footer-tagline">A deterministic control layer for non-deterministic AI.</div>
            </div>
          </div>
          <div className="footer-links">
            <button className="footer-link" onClick={() => scrollTo('hero')}>Overview</button>
            <button className="footer-link" onClick={() => scrollTo('pipeline')}>Architecture</button>
            <button className="footer-link" onClick={() => scrollTo('live')}>Live Demo</button>
            <button className="footer-link" onClick={() => scrollTo('layers')}>Deep Dive</button>
          </div>
          <div className="footer-copy">&copy; 2024–2026 RTG Enterprises. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
