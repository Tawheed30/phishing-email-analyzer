import { useState } from "react";
import { analyzeEmail } from "../services/api";
import type { AnalysisResponse } from "../types";

export function useAnalyzer() {
  const [report, setReport] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(rawEmail: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeEmail(rawEmail);
      setReport(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setReport(null);
    setError(null);
  }

  return { report, loading, error, analyze, reset };
}
