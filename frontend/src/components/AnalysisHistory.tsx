import type { HistoryEntry } from "../hooks/useAnalyzer";
import type { Verdict } from "../types";

const VERDICT_COLOR: Record<Verdict, string> = {
  phishing: "text-cyber-red border-cyber-red/40",
  suspicious: "text-cyber-amber border-cyber-amber/40",
  clean: "text-cyber-green border-cyber-green/40",
  error: "text-cyber-muted border-cyber-muted/40",
};

interface Props {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
}

export default function AnalysisHistory({ history, onRestore }: Props) {
  if (history.length === 0) return null;

  return (
    <div
      data-testid="analysis-history"
      className="rounded-lg border border-cyber-border bg-cyber-surface p-4 space-y-3 animate-fade-in"
    >
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
        ◈ Analysis History ({history.length}/{5})
      </h2>
      <div className="space-y-2">
        {history.map((entry) => {
          const color = VERDICT_COLOR[entry.verdict] ?? VERDICT_COLOR.error;
          const time = new Date(entry.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <button
              key={entry.id}
              data-testid={`history-entry-${entry.id}`}
              onClick={() => onRestore(entry)}
              className="w-full flex items-center gap-3 rounded border border-cyber-border
                         bg-gray-900/50 px-3 py-2 text-left hover:bg-gray-900
                         hover:border-cyber-cyan/30 transition-colors group"
            >
              <span
                className={`shrink-0 text-xs font-mono font-bold uppercase px-1.5 py-0.5
                            rounded border ${color}`}
              >
                {entry.verdict}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono text-gray-300 truncate group-hover:text-white">
                  {entry.subject}
                </p>
                <p className="text-xs text-cyber-muted truncate">{entry.from_address}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-mono text-cyber-muted">{time}</p>
                <p className={`text-xs font-mono font-bold ${color.split(" ")[0]}`}>
                  {entry.confidence}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
