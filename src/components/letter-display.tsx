"use client";

import { useTracingStore } from "@/store/tracing-store";

export function LetterDisplay() {
  const currentChar = useTracingStore((s) => s.currentChar);

  return <div className="hermes-letter-hero">{currentChar}</div>;
}
