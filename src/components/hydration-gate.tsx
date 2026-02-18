"use client";

import { useHydration } from "@/hooks/use-hydration";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <div className="hermes-sky flex h-screen w-screen flex-col items-center justify-center gap-4">
        <div className="hermes-letter-hero hermes-loading-bounce text-5xl">
          A
        </div>
        <div className="hermes-shimmer h-2 w-32 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
