import axios from "axios";
import type { AnalysisReport } from "../types";

const client = axios.create({ baseURL: "/api/v1" });

export async function analyzeEmail(rawEmail: string): Promise<AnalysisReport> {
  const { data } = await client.post<AnalysisReport>("/analyze", {
    raw_email: rawEmail,
  });
  return data;
}
