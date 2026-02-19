"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useTranslation } from "@/hooks/use-translation";

interface CelebrationProps {
  show: boolean;
  celebrationType: "round" | "letter";
  onNext: () => void;
  isLastChar: boolean;
}

export function Celebration({ show, celebrationType, onNext, isLastChar }: CelebrationProps) {
  const firedRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (show && celebrationType === "letter" && !firedRef.current) {
      firedRef.current = true;

      const colors = [
        "#FF6B6B", "#4ECDC4", "#FFD93D",
        "#A78BFA", "#F472B6", "#6BCB77",
      ];

      // Big center burst
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors,
        startVelocity: 35,
      });

      // Sustained side-spray
      const end = Date.now() + 2000;
      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }

    if (!show) {
      firedRef.current = false;
    }
  }, [show, celebrationType]);

  if (!show) return null;

  // Round complete — simpler overlay
  if (celebrationType === "round") {
    return (
      <div className="hermes-round-complete">
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="hermes-bounce-in text-6xl">
            &#10024;
          </div>
          <h2
            className="hermes-bounce-in font-display text-4xl font-bold"
            style={{ color: "var(--hermes-teal)", animationDelay: "0.15s" }}
          >
            {t("celebration.roundComplete")}
          </h2>
          <button
            onClick={onNext}
            className="hermes-bounce-in mt-2 rounded-full px-10 py-3 font-display text-xl font-semibold text-white transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--hermes-teal) 0%, var(--hermes-green) 100%)",
              animationDelay: "0.3s",
            }}
          >
            {t("celebration.nextRound")}
          </button>
        </div>
      </div>
    );
  }

  // Letter complete — full celebration with confetti
  return (
    <div className="hermes-celebration-fullscreen">
      {/* Expanding pulse rings */}
      <div className="hermes-pulse-ring" />
      <div className="hermes-pulse-ring" />
      <div className="hermes-pulse-ring" />

      {/* Spinning starburst */}
      <div className="hermes-starburst" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="hermes-bounce-in text-7xl">
          &#11088;
        </div>
        <h2
          className="hermes-bounce-in hermes-wiggle font-display text-5xl font-bold"
          style={{ color: "var(--hermes-coral)", animationDelay: "0.15s" }}
        >
          {t("celebration.title")}
        </h2>
        <button
          onClick={onNext}
          className="hermes-bounce-in hermes-pulse-glow mt-2 rounded-full px-12 py-4 font-display text-2xl font-semibold text-white transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--hermes-teal) 0%, var(--hermes-green) 100%)",
            animationDelay: "0.3s",
          }}
        >
          {isLastChar ? t("celebration.finish") : t("celebration.next")}
        </button>
      </div>
    </div>
  );
}
