import React, { useState } from "react";

interface Props {
  onSubmit: (rawEmail: string) => void;
  loading: boolean;
}

export default function EmailInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Paste raw email (headers + body)
      </label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={12}
        placeholder="Received: from ...\nFrom: attacker@evil.com\nSubject: ..."
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3
                   font-mono text-sm text-gray-100 placeholder-gray-600
                   focus:border-blue-500 focus:outline-none resize-y"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium
                   hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        {loading ? "Analyzing…" : "Analyze Email"}
      </button>
    </form>
  );
}
