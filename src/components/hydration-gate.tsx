"use client";

import { useHydration } from "@/hooks/use-hydration";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-amber-50">
        <div className="text-2xl text-amber-800 animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
