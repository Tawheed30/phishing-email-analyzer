interface Props {
  recommendations: string[];
}

export default function RecommendationsPanel({ recommendations }: Props) {
  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-surface p-5 space-y-3 animate-fade-in">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
        ◈ Analyst Recommendations
      </h2>

      {recommendations.length === 0 ? (
        <p className="text-sm font-mono text-cyber-muted">No recommendations.</p>
      ) : (
        <ol className="space-y-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 items-start text-sm">
              <span className="font-mono text-cyber-cyan shrink-0 mt-0.5">→</span>
              <span className="text-gray-300 leading-relaxed">{rec}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
