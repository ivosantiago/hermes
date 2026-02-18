"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

interface CelebrationProps {
  show: boolean;
  onNext: () => void;
  isLastChar: boolean;
}

export function Celebration({ show, onNext, isLastChar }: CelebrationProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (show && !firedRef.current) {
      firedRef.current = true;

      // Fire confetti burst
      const end = Date.now() + 1500;
      const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
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
  }, [show]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
      <h2 className="text-5xl font-bold text-green-600 mb-4 animate-bounce">
        Great job!
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        {isLastChar
          ? "You completed all the letters!"
          : "Ready for the next one?"}
      </p>
      <Button
        onClick={onNext}
        size="lg"
        className="text-2xl px-12 py-8 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-lg active:scale-95 transition-transform"
      >
        {isLastChar ? "Celebrate!" : "Next"}
      </Button>
    </div>
  );
}
