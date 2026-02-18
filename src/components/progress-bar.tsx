"use client";

interface ProgressBarProps {
  coverage: number;
  threshold?: number;
}

export function ProgressBar({ coverage, threshold = 0.9 }: ProgressBarProps) {
  const percent = Math.min(Math.round(coverage * 100), 100);
  const isComplete = coverage >= threshold;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-600">Coverage</span>
        <span
          className={`text-sm font-bold ${isComplete ? "text-green-600" : "text-blue-600"}`}
        >
          {percent}%
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isComplete
              ? "bg-green-500"
              : percent > 60
                ? "bg-blue-500"
                : "bg-blue-400"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
