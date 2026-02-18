"use client";

interface ProgressBarProps {
  coverage: number;
  threshold?: number;
}

export function ProgressBar({ coverage, threshold = 0.9 }: ProgressBarProps) {
  const percent = Math.min(Math.round(coverage * 100), 100);
  const isComplete = coverage >= threshold;

  const gradient = isComplete
    ? "linear-gradient(90deg, var(--hermes-green) 0%, var(--hermes-teal) 100%)"
    : percent > 60
      ? "linear-gradient(90deg, var(--hermes-teal) 0%, var(--hermes-coral) 100%)"
      : "linear-gradient(90deg, var(--hermes-coral) 0%, var(--hermes-gold) 100%)";

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-display text-xs font-medium"
          style={{ color: "var(--hermes-navy-light)" }}
        >
          Coverage
        </span>
        <span
          className="font-display text-sm font-semibold"
          style={{
            color: isComplete
              ? "var(--hermes-green)"
              : "var(--hermes-coral)",
          }}
        >
          {percent}%
        </span>
      </div>
      <div className="hermes-progress-track">
        <div
          className="hermes-progress-fill"
          style={{
            width: `${percent}%`,
            background: gradient,
          }}
        />
      </div>
    </div>
  );
}
