import { useState } from "react";
import { SAMPLES } from "../data/samples.js";

const MAX_CHARS = 500_000;
const WARN_MIN = 20;

interface Props {
  onSubmit: (email: string) => void;
  loading: boolean;
}

type SampleKey = keyof typeof SAMPLES;

function getSizeError(text: string): string | null {
  if (text.length > MAX_CHARS)
    return `Email exceeds 500KB limit (${text.length.toLocaleString()} chars — max ${MAX_CHARS.toLocaleString()})`;
  return null;
}

export default function EmailInputPanel({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");
  const [sample, setSample] = useState<SampleKey>("phishing");

  const sizeError = getSizeError(value);
  const tooShortWarning = value.trim().length > 0 && value.trim().length < WARN_MIN;
  const canSubmit = !loading && value.trim().length >= 1 && !sizeError;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) onSubmit(value.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) onSubmit(value.trim());
    }
  }

  function loadSample() {
    setValue(SAMPLES[sample].email);
  }

  return (
    <div className="rounded-lg border border-cyber-border bg-cyber-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyber-muted">
          ◈ Email Input
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={sample}
            onChange={(e) => setSample(e.target.value as SampleKey)}
            disabled={loading}
            className="text-xs font-mono bg-gray-900 border border-cyber-border text-gray-300
                       rounded px-2 py-1 focus:outline-none focus:border-cyber-cyan/50
                       disabled:opacity-40"
          >
            {(Object.keys(SAMPLES) as SampleKey[]).map((k) => (
              <option key={k} value={k}>
                {SAMPLES[k].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadSample}
            disabled={loading}
            data-testid="load-sample-button"
            className="text-xs font-mono px-3 py-1 rounded border border-cyber-border
                       text-gray-400 hover:text-cyber-cyan hover:border-cyber-cyan/50
                       transition-colors disabled:opacity-40"
          >
            LOAD SAMPLE
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={14}
            placeholder="Paste raw email here (headers + body)... or use Ctrl+Enter to submit"
            data-testid="email-textarea"
            className={`w-full rounded border bg-gray-950 px-4 py-3 font-mono text-sm
                        text-gray-200 placeholder-gray-700 focus:outline-none resize-y
                        disabled:opacity-40 transition-colors
                        ${sizeError
                          ? "border-cyber-red focus:border-cyber-red"
                          : "border-cyber-border focus:border-cyber-cyan/40"
                        }`}
          />
          <span
            className={`absolute bottom-2 right-3 text-xs font-mono
                        ${sizeError ? "text-cyber-red" : "text-cyber-muted"}`}
          >
            {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
          </span>
        </div>

        {/* Validation messages */}
        {sizeError && (
          <p data-testid="size-error" className="text-xs font-mono text-cyber-red">
            ⚠ {sizeError}
          </p>
        )}
        {tooShortWarning && !sizeError && (
          <p data-testid="short-warning" className="text-xs font-mono text-cyber-amber">
            ⚡ Email is very short — make sure headers are included for best results
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            data-testid="analyze-button"
            className="rounded border border-cyber-cyan bg-cyber-cyan/10
                       px-6 py-2.5 font-mono text-sm font-semibold text-cyber-cyan
                       tracking-widest uppercase transition-all
                       hover:bg-cyber-cyan/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]
                       disabled:opacity-30 disabled:cursor-not-allowed
                       animate-pulse-glow"
          >
            {loading ? "ANALYZING…" : "ANALYZE THREAT"}
          </button>
          <span className="text-xs font-mono text-cyber-muted hidden sm:block">
            or{" "}
            <kbd className="px-1 py-0.5 rounded border border-cyber-border bg-gray-900 text-gray-400">
              Ctrl
            </kbd>
            {" + "}
            <kbd className="px-1 py-0.5 rounded border border-cyber-border bg-gray-900 text-gray-400">
              Enter
            </kbd>
          </span>
        </div>
      </form>

      {loading && (
        <div className="space-y-2 animate-fade-in">
          <div className="overflow-hidden h-0.5 w-full rounded bg-gray-800">
            <div className="h-full w-1/4 bg-cyber-cyan rounded animate-scan" />
          </div>
          <p className="text-xs font-mono text-cyber-cyan text-center tracking-widest">
            ANALYZING WITH CLAUDE AI…
          </p>
        </div>
      )}
    </div>
  );
}
