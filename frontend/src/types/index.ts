export type Verdict = "phishing" | "suspicious" | "clean" | "error";

export interface IOC {
  type: string;
  value: string;
  context: string;
}

export interface MitreTTP {
  technique_id: string;
  technique_name: string;
  tactic: string;
}

export interface AuthResult {
  status: string;
  detail: string;
}

export interface EmailAuthentication {
  spf: AuthResult;
  dkim: AuthResult;
  dmarc: AuthResult;
}

export interface Attachment {
  filename: string;
  mime_type: string;
}

export interface SuspiciousFlags {
  reply_to_mismatch: boolean;
  display_name_mismatch: boolean;
  missing_message_id: boolean;
  missing_date: boolean;
  suspicious_received_chain: boolean;
}

export interface ParsedEmail {
  from_address: string;
  from_display_name: string | null;
  to_addresses: string[];
  reply_to: string | null;
  subject: string;
  date: string | null;
  message_id: string | null;
  return_path: string | null;
  received_hops: string[];
  authentication: EmailAuthentication;
  plain_text_body: string | null;
  html_body: string | null;
  urls: string[];
  attachments: Attachment[];
  suspicious_flags: SuspiciousFlags;
}

export interface AnalysisResponse {
  verdict: Verdict;
  confidence: number;
  summary: string;
  red_flags: string[];
  iocs: IOC[];
  mitre_ttps: MitreTTP[];
  recommendations: string[];
  analyst_notes: string | null;
  processing_time_ms: number;
  parsed_email: ParsedEmail;
}
