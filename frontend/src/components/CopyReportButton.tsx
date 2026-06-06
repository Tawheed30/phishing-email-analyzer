import { useState } from "react";
import type { AnalysisResponse } from "../types";

function formatReport(r: AnalysisResponse): string {
  const line = "═".repeat(58);
  const pe = r.parsed_email;
  const ts = new Date().toISOString();

  const iocLines = r.iocs.length
    ? r.iocs.map((i) => `  [${i.type.toUpperCase().padEnd(6)}] ${i.value}\n           → ${i.context}`).join("\n")
    : "  None identified";

  const ttpLines = r.mitre_ttps.length
    ? r.mitre_ttps.map((t) => `  ${t.technique_id}  ${t.technique_name}  [${t.tactic}]`).join("\n")
    : "  None mapped";

  const flagLines = r.red_flags.length
    ? r.red_flags.map((f) => `  ◆ ${f}`).join("\n")
    : "  No red flags detected";

  const recLines = r.recommendations.length
    ? r.recommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join("\n")
    : "  No recommendations";

  return `${line}
  PHISHING EMAIL ANALYSIS REPORT
  Generated: ${ts}
${line}

VERDICT:    ${r.verdict.toUpperCase()} (${r.confidence}% confidence)
ANALYZED:   ${(r.processing_time_ms / 1000).toFixed(1)}s

SUMMARY:
  ${r.summary}
${r.analyst_notes ? `\nANALYST NOTES:\n  ${r.analyst_notes}` : ""}
RED FLAGS (${r.red_flags.length}):
${flagLines}

INDICATORS OF COMPROMISE (${r.iocs.length}):
${iocLines}

MITRE ATT&CK TECHNIQUES (${r.mitre_ttps.length}):
${ttpLines}

RECOMMENDATIONS:
${recLines}

PARSED EMAIL:
  From:     ${pe.from_display_name ? `${pe.from_display_name} <${pe.from_address}>` : pe.from_address}
  Subject:  ${pe.subject}
  Date:     ${pe.date ?? "MISSING"}
  SPF:      ${pe.authentication.spf.status}
  DKIM:     ${pe.authentication.dkim.status}
  DMARC:    ${pe.authentication.dmarc.status}
  URLs:     ${pe.urls.length}
  Attachments: ${pe.attachments.length}

${line}`;
}

interface Props {
  report: AnalysisResponse;
}

export default function CopyReportButton({ report }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = formatReport(report);
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      data-testid="copy-report-button"
      className="font-mono text-xs px-4 py-2 rounded border transition-colors
                 border-cyber-border text-cyber-muted hover:text-cyber-cyan
                 hover:border-cyber-cyan/40 bg-gray-900/50"
    >
      {copied ? "✓ REPORT COPIED" : "⎘ COPY REPORT"}
    </button>
  );
}

export { formatReport };
