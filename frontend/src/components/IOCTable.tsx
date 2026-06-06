import { useState } from "react";
import type { IOC } from "../types";

const TYPE_STYLES: Record<string, string> = {
  url: "text-cyan-400 bg-cyan-950 border-cyan-800",
  ip: "text-yellow-400 bg-yellow-950 border-yellow-800",
  domain: "text-orange-400 bg-orange-950 border-orange-800",
  email: "text-purple-400 bg-purple-950 border-purple-800",
  hash: "text-slate-400 bg-slate-800 border-slate-600",
};

interface Props {
  iocs: IOC[];
}

export default function IOCTable({ iocs }: Props) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  function copyToClipboard(val: string) {
    navigator.clipboard?.writeText(val).then(() => {
      setCopiedValue(val);
      setTimeout(() => setCopiedValue(null), 2000);
    });
  }

  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-surface p-5 space-y-3 animate-fade-in">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
        ◈ Indicators of Compromise (IOCs)
      </h2>

      {iocs.length === 0 ? (
        <p className="text-sm font-mono text-cyber-muted">No IOCs identified.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-cyber-border">
                <th className="text-left py-2 px-3 font-mono text-xs text-cyber-muted uppercase tracking-wider w-24">
                  Type
                </th>
                <th className="text-left py-2 px-3 font-mono text-xs text-cyber-muted uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left py-2 px-3 font-mono text-xs text-cyber-muted uppercase tracking-wider">
                  Context
                </th>
              </tr>
            </thead>
            <tbody>
              {iocs.map((ioc, i) => {
                const typeStyle = TYPE_STYLES[ioc.type.toLowerCase()] ?? TYPE_STYLES.hash;
                const isCopied = copiedValue === ioc.value;
                return (
                  <tr
                    key={i}
                    className="border-b border-cyber-border/50 hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded border ${typeStyle}`}
                      >
                        {ioc.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => copyToClipboard(ioc.value)}
                        title="Click to copy"
                        className="flex items-center gap-2 group text-left"
                      >
                        <span className="font-mono text-xs text-gray-300 break-all group-hover:text-cyber-cyan transition-colors">
                          {ioc.value}
                        </span>
                        <span className="shrink-0 text-xs text-cyber-muted group-hover:text-cyber-cyan transition-colors">
                          {isCopied ? "✓" : "⎘"}
                        </span>
                      </button>
                      {isCopied && (
                        <span className="block text-xs font-mono text-cyber-green mt-0.5">
                          Copied to clipboard
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-500 font-mono">
                      {ioc.context}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
