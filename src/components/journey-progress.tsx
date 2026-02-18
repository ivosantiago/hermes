"use client";

import { useMemo } from "react";

interface JourneyProgressProps {
  coverage: number;
  threshold: number;
}

const STAR_COUNT = 9;

export function JourneyProgress({ coverage, threshold }: JourneyProgressProps) {
  const filledStars = useMemo(() => {
    // Map coverage 0..threshold to 0..STAR_COUNT stars
    const ratio = Math.min(coverage / threshold, 1);
    return Math.floor(ratio * STAR_COUNT);
  }, [coverage, threshold]);

  const isComplete = coverage >= threshold;

  return (
    <div
      className={`hermes-stars-container ${isComplete ? "hermes-stars-complete" : ""}`}
    >
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const filled = i < filledStars;
        return (
          <svg
            key={i}
            className={`hermes-star ${filled ? "hermes-star-filled" : "hermes-star-empty"}`}
            viewBox="0 0 24 24"
            fill={filled ? "var(--hermes-gold)" : "#ccc"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}
