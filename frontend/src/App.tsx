import { useChat } from './hooks/useChat';
import HeroHeader from './components/HeroHeader';
import GovernanceStrip from './components/GovernanceStrip';
import ChatPanel from './components/ChatPanel';
import AnalysisSidebar from './components/AnalysisSidebar';
import HexSpaceVisualization from './components/HexSpaceVisualization';
import AuditTrail from './components/AuditTrail';

export default function App() {
  const { messages, trajectory, auditLog, currentAnalysis, isProcessing, turnNumber, send } = useChat();

  return (
    <div className="app">
      <HeroHeader />
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

      <footer className="app-footer">
        RGBY.ai | AI Signal Observability and Drift Governance Infrastructure | 2026
      </footer>
    </div>
  );
}
