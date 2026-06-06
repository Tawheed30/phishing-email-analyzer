import { useState } from "react";
import { analyzeEmail } from "../services/api";
import type { AnalysisResponse, Verdict } from "../types";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  subject: string;
  from_address: string;
  verdict: Verdict;
  confidence: number;
  report: AnalysisResponse;
}

const MAX_HISTORY = 5;

export function useAnalyzer() {
  const [report, setReport] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastEmail, setLastEmail] = useState<string>("");

  async function analyze(rawEmail: string) {
    setLoading(true);
    setError(null);
    setLastEmail(rawEmail);
    try {
      const result = await analyzeEmail(rawEmail);
      setReport(result);
      setHistory((prev) =>
        [
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            subject: result.parsed_email.subject || "(no subject)",
            from_address: result.parsed_email.from_address,
            verdict: result.verdict,
            confidence: result.confidence,
            report: result,
          },
          ...prev,
        ].slice(0, MAX_HISTORY)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    if (lastEmail) analyze(lastEmail);
  }

  function restore(entry: HistoryEntry) {
    setReport(entry.report);
    setError(null);
  }

  function reset() {
    setReport(null);
    setError(null);
  }

  return { report, loading, error, analyze, reset, retry, history, restore };
}
