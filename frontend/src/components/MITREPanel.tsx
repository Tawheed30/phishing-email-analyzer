import type { MitreTTP } from "../types";

interface Props {
  ttps: MitreTTP[];
}

function mitreUrl(id: string): string {
  // T1566.001 → https://attack.mitre.org/techniques/T1566/001/
  const parts = id.split(".");
  return `https://attack.mitre.org/techniques/${parts.join("/")}/`;
}

export default function MITREPanel({ ttps }: Props) {
  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-surface p-5 space-y-3 animate-fade-in">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
        ◈ MITRE ATT&amp;CK Techniques
      </h2>

      {ttps.length === 0 ? (
        <p className="text-sm font-mono text-cyber-muted">No MITRE techniques mapped.</p>
      ) : (
        <div className="space-y-2">
          {ttps.map((ttp) => (
            <div
              key={ttp.technique_id}
              className="flex flex-wrap items-start gap-3 rounded border border-cyber-border bg-gray-900/60 px-3 py-2.5"
            >
              <a
                href={mitreUrl(ttp.technique_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-mono text-xs font-bold px-2 py-0.5 rounded
                           border border-cyber-cyan/40 text-cyber-cyan bg-cyber-cyan/5
                           hover:bg-cyber-cyan/15 transition-colors"
              >
                {ttp.technique_id}
              </a>
              <span className="font-mono text-sm text-gray-200 flex-1">
                {ttp.technique_name}
              </span>
              <span className="text-xs font-mono text-cyber-muted px-2 py-0.5 rounded border border-cyber-border">
                {ttp.tactic}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
