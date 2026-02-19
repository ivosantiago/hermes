"use client";

import { useTracingStore } from "@/store/tracing-store";
import { DIFFICULTY_CONFIGS } from "@/types";

export function LetterDisplay() {
  const currentChar = useTracingStore((s) => s.currentChar);
  const difficulty = useTracingStore((s) => s.settings.difficulty);
  const progress = useTracingStore((s) => s.progress);

  const config = DIFFICULTY_CONFIGS[difficulty];
  const letterProgress = progress[currentChar];
  const completedRounds = letterProgress?.completedRounds ?? 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="hermes-letter-hero">{currentChar}</div>
      {config.rounds > 1 && (
        <div className="flex gap-1.5">
          {Array.from({ length: config.rounds }, (_, i) => (
            <div
              key={i}
              className={`hermes-round-dot ${
                i < completedRounds
                  ? "hermes-round-dot-filled"
                  : "hermes-round-dot-empty"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
