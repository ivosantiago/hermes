"use client";

import { HydrationGate } from "@/components/hydration-gate";
import { TracingCanvas } from "@/components/tracing-canvas";
import { LetterDisplay } from "@/components/letter-display";
import { ParentControls } from "@/components/parent-controls";
import { CompletionScreen } from "@/components/completion-screen";
import { useTracingStore } from "@/store/tracing-store";

function AppContent() {
  const currentChar = useTracingStore((s) => s.currentChar);

  if (currentChar === "COMPLETED") {
    return <CompletionScreen />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-amber-50 px-4 py-4 gap-4 font-sans">
      {/* Header */}
      <div className="flex w-full max-w-2xl items-center justify-between">
        <LetterDisplay />
        <h1 className="text-lg font-semibold text-amber-700">Hermes</h1>
      </div>

      {/* Canvas area */}
      <TracingCanvas />

      {/* Parent controls */}
      <ParentControls />
    </div>
  );
}

export default function Home() {
  return (
    <HydrationGate>
      <AppContent />
    </HydrationGate>
  );
}
