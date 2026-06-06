import Navbar from "./components/Navbar";
import EmailInputPanel from "./components/EmailInputPanel";
import VerdictBanner from "./components/VerdictBanner";
import AnalysisSummary from "./components/AnalysisSummary";
import ParsedEmailDetails from "./components/ParsedEmailDetails";
import RedFlagsPanel from "./components/RedFlagsPanel";
import IOCTable from "./components/IOCTable";
import MITREPanel from "./components/MITREPanel";
import RecommendationsPanel from "./components/RecommendationsPanel";
import WelcomeState from "./components/WelcomeState";
import AnalysisHistory from "./components/AnalysisHistory";
import CopyReportButton from "./components/CopyReportButton";
import { useAnalyzer } from "./hooks/useAnalyzer";
import type { ReactNode } from "react";

function Stagger({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <div style={{ animationDelay: `${delay}ms` }} className="animate-fade-in">
      {children}
    </div>
  );
}

export default function App() {
  const { report, loading, error, analyze, retry, history, restore } = useAnalyzer();

  const showWelcome = !loading && !error && !report;

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        <EmailInputPanel onSubmit={analyze} loading={loading} />

        {/* History (only shown after at least one analysis) */}
        {history.length > 0 && (
          <AnalysisHistory history={history} onRestore={restore} />
        )}

        {/* Error banner with retry */}
        {error && (
          <div
            data-testid="error-banner"
            className="rounded-lg border border-cyber-red/50 bg-red-950/30 px-4 py-4
                       font-mono animate-fade-in"
          >
            <p className="text-sm text-cyber-red mb-3">⚠ {error}</p>
            <button
              onClick={retry}
              data-testid="retry-button"
              className="text-xs px-3 py-1.5 rounded border border-cyber-red/50
                         text-cyber-red hover:bg-red-950 transition-colors"
            >
              ↺ RETRY ANALYSIS
            </button>
          </div>
        )}

        {/* Welcome / empty state */}
        {showWelcome && <WelcomeState />}

        {/* Results — staggered fade-in */}
        {report && (
          <>
            <Stagger delay={0}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <VerdictBanner report={report} />
                </div>
              </div>
            </Stagger>

            <Stagger delay={0}>
              <div className="flex justify-end">
                <CopyReportButton report={report} />
              </div>
            </Stagger>

            <Stagger delay={80}>
              <AnalysisSummary report={report} />
            </Stagger>

            <Stagger delay={160}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RedFlagsPanel flags={report.red_flags} />
                <RecommendationsPanel recommendations={report.recommendations} />
              </div>
            </Stagger>

            <Stagger delay={240}>
              <IOCTable iocs={report.iocs} />
            </Stagger>

            <Stagger delay={320}>
              <MITREPanel ttps={report.mitre_ttps} />
            </Stagger>

            <Stagger delay={400}>
              <ParsedEmailDetails parsed={report.parsed_email} />
            </Stagger>
          </>
        )}
      </main>
    </div>
  );
}
