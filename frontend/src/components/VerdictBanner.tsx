import { useEffect, useState } from "react";
import type { AnalysisResponse, Verdict } from "../types";

const CONFIG: Record<Verdict, { label: string; bar: string; text: string }> = {
  phishing: { label: "⚠ PHISHING DETECTED", bar: "#ff3b5c", text: "#ff3b5c" },
  suspicious: { label: "⚡ SUSPICIOUS", bar: "#ffb800", text: "#ffb800" },
  clean: { label: "✓ CLEAN", bar: "#00ff88", text: "#00ff88" },
  error: { label: "✗ ANALYSIS ERROR", bar: "#64748b", text: "#64748b" },
};

interface Props {
  report: AnalysisResponse;
}

export default function VerdictBanner({ report }: Props) {
  const { verdict, confidence, processing_time_ms } = report;
  const cfg = CONFIG[verdict] ?? CONFIG.error;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(confidence), 80);
    return () => clearTimeout(t);
  }, [confidence]);

  const secs = (processing_time_ms / 1000).toFixed(1);

  return (
    <div
      data-testid="verdict-banner"
      data-verdict={verdict}
      className={`rounded-lg border-2 bg-cyber-surface p-6 animate-fade-in verdict-${verdict}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-cyber-muted tracking-widest uppercase mb-1">
            Threat Verdict
          </p>
          <p
            className="text-3xl font-mono font-bold tracking-wide"
            style={{ color: cfg.text }}
          >
            {cfg.label}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-cyber-muted tracking-widest uppercase mb-1">
            Confidence
          </p>
          <p className="text-3xl font-mono font-bold" style={{ color: cfg.text }}>
            {confidence}%
          </p>
          <p className="text-xs font-mono text-cyber-muted mt-1">
            Analyzed in {secs}s
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${barWidth}%`, backgroundColor: cfg.bar }}
        />
      </div>
    </div>
  );
}
