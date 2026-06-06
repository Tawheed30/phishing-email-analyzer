import type { AnalysisResponse } from "../types";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "";

export async function analyzeEmail(rawEmail: string): Promise<AnalysisResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_email: rawEmail }),
    });
  } catch {
    throw new Error("Backend unavailable — is the server running?");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<AnalysisResponse>;
}
