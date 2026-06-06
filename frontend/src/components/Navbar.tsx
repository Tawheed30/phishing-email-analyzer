export default function Navbar() {
  return (
    <header className="border-b border-cyber-border bg-cyber-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-cyber-red text-lg">◈</span>
            <span className="font-mono font-bold text-lg tracking-widest text-cyber-cyan">
              PHISH<span className="text-white">ANALYZER</span>
            </span>
          </div>
          <span className="hidden sm:block text-xs text-cyber-muted font-mono tracking-wider border-l border-cyber-border pl-4">
            SOC THREAT INTELLIGENCE TOOL
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded border border-cyber-cyan/30 text-cyber-cyan bg-cyber-cyan/5">
            v1.0
          </span>
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" title="System online" />
        </div>
      </div>
    </header>
  );
}
