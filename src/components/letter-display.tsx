"use client";

import { useTracingStore } from "@/store/tracing-store";
import { getCategory, ALL_CHARS } from "@/types";

export function LetterDisplay() {
  const currentChar = useTracingStore((s) => s.currentChar);
  const progress = useTracingStore((s) => s.progress);

  const idx = ALL_CHARS.indexOf(currentChar);
  const total = ALL_CHARS.length;
  const completedCount = Object.values(progress).filter(
    (p) => p.completed
  ).length;

  const category = getCategory(currentChar);
  const categoryLabel =
    category === "uppercase"
      ? "Uppercase"
      : category === "lowercase"
        ? "Lowercase"
        : "Numbers";

  return (
    <div className="flex items-center gap-4 text-amber-800">
      <div className="text-center">
        <span className="text-4xl font-bold">{currentChar}</span>
      </div>
      <div className="text-sm">
        <div className="font-medium">{categoryLabel}</div>
        <div className="text-amber-600">
          {idx + 1} / {total} · {completedCount} done
        </div>
      </div>
    </div>
  );
}
