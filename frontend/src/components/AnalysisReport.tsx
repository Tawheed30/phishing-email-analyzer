import React from "react";
import type { AnalysisReport as Report, Verdict } from "../types";

const VERDICT_STYLES: Record<Verdict, string> = {
  phishing: "bg-red-900 text-red-300 border-red-700",
  suspicious: "bg-orange-900 text-orange-300 border-orange-700",
  clean: "bg-green-900 text-green-300 border-green-700",
};

interface Props {
  report: Report;
}

export default function AnalysisReport({ report }: Props) {
  return (
    <div className="space-y-6">
      {/* Verdict banner */}
      <div
        className={`rounded-lg border px-5 py-4 flex items-center justify-between ${VERDICT_STYLES[report.verdict]}`}
      >
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold opacity-70">
            Verdict
          </span>
          <p className="text-2xl font-bold capitalize">{report.verdict}</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-widest font-semibold opacity-70">
            Confidence
          </span>
          <p className="text-2xl font-bold">
            {Math.round(report.confidence_score * 100)}%
          </p>
        </div>
      </div>

      {/* Summary */}
      <Section title="Summary">
        <p className="text-sm text-gray-300 leading-relaxed">{report.summary}</p>
      </Section>

      {/* Red flags */}
      {report.red_flags.length > 0 && (
        <Section title="Red Flags">
          <ul className="space-y-1">
            {report.red_flags.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5">▶</span> {f}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* IOCs */}
      <Section title="Indicators of Compromise (IOCs)">
        <IocGroup label="URLs" items={report.iocs.urls} />
        <IocGroup label="Domains" items={report.iocs.domains} />
        <IocGroup label="IPs" items={report.iocs.ips} />
        <IocGroup label="Email Addresses" items={report.iocs.email_addresses} />
      </Section>

      {/* MITRE ATT&CK */}
      {report.mitre_attack.length > 0 && (
        <Section title="MITRE ATT&CK Techniques">
          <div className="space-y-2">
            {report.mitre_attack.map((t) => (
              <div
                key={t.technique_id}
                className="flex gap-3 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm"
              >
                <span className="font-mono text-blue-400 shrink-0">
                  {t.technique_id}
                </span>
                <span className="text-gray-200">{t.technique_name}</span>
                <span className="ml-auto text-gray-500 text-xs self-center">
                  {t.tactic}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Section title="Analyst Recommendations">
          <ol className="space-y-1 list-decimal list-inside">
            {report.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-gray-300">
                {r}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 px-5 py-4 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

function IocGroup({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {items.map((item, i) => (
        <p key={i} className="font-mono text-xs text-yellow-300 break-all">
          {item}
        </p>
      ))}
    </div>
  );
}
