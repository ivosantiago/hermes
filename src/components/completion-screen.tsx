"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { useTracingStore } from "@/store/tracing-store";

export function CompletionScreen() {
  const resetProgress = useTracingStore((s) => s.resetProgress);

  useEffect(() => {
    // Big celebration
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.6 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.6 },
      });
      confetti({
        particleCount: 3,
        angle: 90,
        spread: 120,
        origin: { x: 0.5, y: 0.4 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-100 to-amber-50 p-8">
      <div className="text-8xl mb-6">🎉</div>
      <h1 className="text-5xl font-bold text-amber-800 mb-4 text-center">
        Amazing Work!
      </h1>
      <p className="text-2xl text-amber-700 mb-2 text-center">
        You traced every letter and number!
      </p>
      <p className="text-lg text-amber-600 mb-12 text-center">
        A-Z, a-z, and 0-9 — all 62 characters!
      </p>
      <Button
        onClick={resetProgress}
        size="lg"
        className="text-2xl px-12 py-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg active:scale-95 transition-transform"
      >
        Start Over
      </Button>
    </div>
  );
}
