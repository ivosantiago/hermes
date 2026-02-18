"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useTracingStore } from "@/store/tracing-store";
import { BackgroundShapes } from "@/components/background-shapes";

export function CompletionScreen() {
  const resetProgress = useTracingStore((s) => s.resetProgress);

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = [
      "#FF6B6B", "#4ECDC4", "#FFD93D",
      "#A78BFA", "#F472B6", "#6BCB77",
    ];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 90,
        spread: 120,
        origin: { x: 0.5, y: 0.4 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="hermes-sky fixed inset-0 flex flex-col items-center justify-center overflow-hidden p-8">
      <BackgroundShapes />

      {/* Spinning starburst */}
      <div className="hermes-starburst" style={{ width: 500, height: 500 }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="hermes-bounce-in text-8xl">
          &#127881;
        </div>
        <h1
          className="hermes-bounce-in hermes-wiggle font-display text-5xl font-bold text-center"
          style={{ color: "var(--hermes-coral)", animationDelay: "0.2s" }}
        >
          Amazing Work!
        </h1>
        <p
          className="hermes-bounce-in font-display text-2xl font-medium text-center"
          style={{ color: "var(--hermes-navy)", animationDelay: "0.35s" }}
        >
          You traced every letter and number!
        </p>
        <p
          className="hermes-bounce-in text-base text-center"
          style={{ color: "var(--hermes-navy-light)", opacity: 0.7, animationDelay: "0.45s" }}
        >
          A&ndash;Z, a&ndash;z, and 0&ndash;9 &mdash; all 62 characters!
        </p>
        <button
          onClick={resetProgress}
          className="hermes-bounce-in hermes-pulse-glow mt-4 rounded-full px-12 py-5 font-display text-2xl font-semibold text-white transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--hermes-coral) 0%, var(--hermes-gold) 100%)",
            animationDelay: "0.6s",
          }}
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
