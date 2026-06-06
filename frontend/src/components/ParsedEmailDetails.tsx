import { useState } from "react";
import type { ParsedEmail } from "../types";

const AUTH_STYLES: Record<string, string> = {
  pass: "text-cyber-green bg-green-950 border-green-800",
  fail: "text-cyber-red bg-red-950 border-red-900",
  softfail: "text-cyber-amber border-yellow-800 bg-yellow-950",
  none: "text-cyber-muted bg-gray-800 border-gray-700",
  unknown: "text-cyber-muted bg-gray-800 border-gray-700",
};

function AuthBadge({ label, status }: { label: string; status: string }) {
  const style = AUTH_STYLES[status.toLowerCase()] ?? AUTH_STYLES.unknown;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-cyber-muted w-12 shrink-0">{label}</span>
      <span
        className={`inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${style}`}
      >
        {status.toUpperCase()}
      </span>
    </div>
  );
}

interface Props {
  parsed: ParsedEmail;
}

export default function ParsedEmailDetails({ parsed }: Props) {
  const [open, setOpen] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  function copyUrl(url: string) {
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  }

  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-surface animate-fade-in">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3
                   text-left hover:bg-gray-900/30 transition-colors rounded-t-lg"
      >
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
          ◈ Parsed Email Details
        </span>
        <span className="text-cyber-muted text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-cyber-border">
          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {[
              { label: "FROM", value: parsed.from_display_name ? `${parsed.from_display_name} <${parsed.from_address}>` : parsed.from_address },
              { label: "REPLY-TO", value: parsed.reply_to ?? "—" },
              { label: "SUBJECT", value: parsed.subject },
              { label: "DATE", value: parsed.date ?? "MISSING" },
              { label: "MESSAGE-ID", value: parsed.message_id ?? "MISSING" },
              { label: "RETURN-PATH", value: parsed.return_path ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs font-mono text-cyber-muted">{label}</p>
                <p className="text-xs font-mono text-gray-300 break-all">{value}</p>
              </div>
            ))}
          </div>

          {/* Auth results */}
          <div>
            <p className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-2">
              Authentication
            </p>
            <div className="flex flex-wrap gap-3">
              <AuthBadge label="SPF" status={parsed.authentication.spf.status} />
              <AuthBadge label="DKIM" status={parsed.authentication.dkim.status} />
              <AuthBadge label="DMARC" status={parsed.authentication.dmarc.status} />
            </div>
          </div>

          {/* Extracted URLs */}
          {parsed.urls.length > 0 && (
            <div>
              <p className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-2">
                Extracted URLs ({parsed.urls.length})
              </p>
              <div className="space-y-1.5">
                {parsed.urls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => copyUrl(url)}
                      title="Click to copy (do not open)"
                      className="flex items-center gap-2 group text-left"
                    >
                      <span className="font-mono text-xs text-gray-400 break-all group-hover:text-cyber-amber transition-colors">
                        {url}
                      </span>
                      <span className="shrink-0 text-xs text-cyber-muted group-hover:text-cyber-amber">
                        {copiedUrl === url ? "✓" : "⎘"}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {parsed.attachments.length > 0 && (
            <div>
              <p className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-2">
                Attachments ({parsed.attachments.length})
              </p>
              <div className="space-y-1">
                {parsed.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs font-mono text-cyber-amber"
                  >
                    <span>📎</span>
                    <span>{att.filename}</span>
                    <span className="text-cyber-muted">({att.mime_type})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious flags */}
          {Object.values(parsed.suspicious_flags).some(Boolean) && (
            <div>
              <p className="text-xs font-mono text-cyber-muted uppercase tracking-widest mb-2">
                Parser Flags
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(parsed.suspicious_flags) as [string, boolean][])
                  .filter(([, v]) => v)
                  .map(([key]) => (
                    <span
                      key={key}
                      className="text-xs font-mono px-2 py-0.5 rounded border border-cyber-red/40 text-cyber-red bg-red-950/40"
                    >
                      {key.replace(/_/g, " ")}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
