import React from "react";
import EmailInput from "./components/EmailInput";
import AnalysisReport from "./components/AnalysisReport";
import { useAnalyzer } from "./hooks/useAnalyzer";

export default function App() {
  const { report, loading, error, analyze } = useAnalyzer();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Phishing Email Analyzer
        </h1>
        <p className="text-sm text-gray-400">
          AI-powered threat detection using Claude
        </p>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        <EmailInput onSubmit={analyze} loading={loading} />
        {error && (
          <div className="rounded-lg border border-red-700 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {report && <AnalysisReport report={report} />}
      </main>
    </div>
  );
}
