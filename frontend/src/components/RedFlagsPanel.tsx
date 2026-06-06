interface Props {
  flags: string[];
}

export default function RedFlagsPanel({ flags }: Props) {
  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-surface p-5 space-y-3 animate-fade-in">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
        🚨 Red Flags Detected ({flags.length})
      </h2>
      {flags.length === 0 ? (
        <p className="text-sm font-mono text-cyber-green">No red flags detected.</p>
      ) : (
        <ul className="space-y-2">
          {flags.map((flag, i) => (
            <li key={i} className="flex gap-3 items-start text-sm">
              <span className="text-cyber-red mt-0.5 shrink-0">◆</span>
              <span className="font-mono text-gray-300">{flag}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
