export interface IOCs {
  urls: string[];
  ips: string[];
  domains: string[];
  email_addresses: string[];
}

export interface MitreAttack {
  technique_id: string;
  technique_name: string;
  tactic: string;
}

export type Verdict = "phishing" | "suspicious" | "clean";

export interface AnalysisReport {
  verdict: Verdict;
  confidence_score: number;
  summary: string;
  red_flags: string[];
  iocs: IOCs;
  mitre_attack: MitreAttack[];
  recommendations: string[];
}
