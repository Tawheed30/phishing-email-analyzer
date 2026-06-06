import Navbar from "./components/Navbar";
import EmailInputPanel from "./components/EmailInputPanel";
import VerdictBanner from "./components/VerdictBanner";
import AnalysisSummary from "./components/AnalysisSummary";
import ParsedEmailDetails from "./components/ParsedEmailDetails";
import RedFlagsPanel from "./components/RedFlagsPanel";
import IOCTable from "./components/IOCTable";
import MITREPanel from "./components/MITREPanel";
import RecommendationsPanel from "./components/RecommendationsPanel";
import { useAnalyzer } from "./hooks/useAnalyzer";

export default function App() {
  const { report, loading, error, analyze } = useAnalyzer();

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        <EmailInputPanel onSubmit={analyze} loading={loading} />

        {error && (
          <div
            data-testid="error-banner"
            className="rounded-lg border border-cyber-red/50 bg-red-950/30 px-4 py-3
                       text-sm font-mono text-cyber-red animate-fade-in"
          >
            ⚠ {error}
          </div>
        )}

        {report && (
          <>
            <VerdictBanner report={report} />
            <AnalysisSummary report={report} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RedFlagsPanel flags={report.red_flags} />
              <RecommendationsPanel recommendations={report.recommendations} />
            </div>

            <IOCTable iocs={report.iocs} />
            <MITREPanel ttps={report.mitre_ttps} />
            <ParsedEmailDetails parsed={report.parsed_email} />
          </>
        )}
      </main>
    </div>
  );
}
