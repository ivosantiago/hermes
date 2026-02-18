"use client";

import { useTracingStore } from "@/store/tracing-store";

export function ClearButton() {
  const clearCurrentStrokes = useTracingStore((s) => s.clearCurrentStrokes);

  return (
    <button
      onClick={clearCurrentStrokes}
      className="hermes-fab"
      aria-label="Clear drawing"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.8 1.4c.8-.8 2-.8 2.8 0l5 5c.8.8.8 2 0 2.8L11.4 20" />
        <path d="M6.5 13.5 14 6" />
      </svg>
    </button>
  );
}
