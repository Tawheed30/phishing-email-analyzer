import { useState } from "react";
import { analyzeEmail } from "../services/api";
import type { AnalysisReport } from "../types";

export function useAnalyzer() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(rawEmail: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeEmail(rawEmail);
      setReport(result);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Analysis failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { report, loading, error, analyze };
}
