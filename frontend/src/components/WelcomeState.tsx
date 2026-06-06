export default function WelcomeState() {
  return (
    <div
      data-testid="welcome-state"
      className="rounded-lg border border-cyber-border bg-cyber-surface p-8 text-center space-y-6 animate-fade-in"
    >
      <div className="space-y-2">
        <p className="text-5xl">◈</p>
        <h2 className="font-mono text-xl font-bold text-cyber-cyan tracking-wide">
          READY FOR ANALYSIS
        </h2>
        <p className="text-sm text-cyber-muted max-w-md mx-auto">
          Paste a raw RFC&nbsp;2822 email (headers&nbsp;+&nbsp;body) or load a sample, then click{" "}
          <span className="font-mono text-cyber-cyan">ANALYZE THREAT</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
        {[
          {
            icon: "🔍",
            title: "Header Parsing",
            desc: "Extracts SPF, DKIM, DMARC, Received chain, and all header anomalies",
          },
          {
            icon: "🤖",
            title: "Claude AI Analysis",
            desc: "SOC Tier 2 threat assessment with confidence scoring and evidence-based verdicts",
          },
          {
            icon: "📋",
            title: "Threat Report",
            desc: "IOCs, MITRE ATT&CK techniques, red flags, and analyst recommendations",
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="rounded border border-cyber-border bg-gray-900/50 p-4 space-y-1"
          >
            <p className="text-lg">{icon}</p>
            <p className="font-mono text-xs font-semibold text-cyber-cyan uppercase tracking-wider">
              {title}
            </p>
            <p className="text-xs text-cyber-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <p className="text-xs font-mono text-cyber-muted">
        Tip: Use <kbd className="px-1.5 py-0.5 rounded border border-cyber-border bg-gray-900 text-gray-300">Ctrl</kbd>
        {" + "}
        <kbd className="px-1.5 py-0.5 rounded border border-cyber-border bg-gray-900 text-gray-300">Enter</kbd>
        {" "}to submit
      </p>
    </div>
  );
}
