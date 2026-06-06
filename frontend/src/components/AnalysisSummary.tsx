import type { AnalysisResponse } from "../types";

interface Props {
  report: AnalysisResponse;
}

export default function AnalysisSummary({ report }: Props) {
  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-surface p-5 space-y-3 animate-fade-in">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
        ◈ Analyst Summary
      </h2>
      <p className="text-sm text-gray-300 leading-relaxed">{report.summary}</p>
      {report.analyst_notes && (
        <blockquote className="border-l-2 border-cyber-muted pl-4 mt-2">
          <p className="text-xs font-mono text-cyber-muted italic leading-relaxed">
            {report.analyst_notes}
          </p>
        </blockquote>
      )}
    </div>
  );
}
