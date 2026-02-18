"use client";

import { HydrationGate } from "@/components/hydration-gate";
import { TracingCanvas } from "@/components/tracing-canvas";
import { LetterDisplay } from "@/components/letter-display";
import { ParentControls } from "@/components/parent-controls";
import { ClearButton } from "@/components/clear-button";
import { BackgroundShapes } from "@/components/background-shapes";
import { CompletionScreen } from "@/components/completion-screen";
import { useTracingStore } from "@/store/tracing-store";

function AppContent() {
  const currentChar = useTracingStore((s) => s.currentChar);

  if (currentChar === "COMPLETED") {
    return <CompletionScreen />;
  }

  return (
    <div className="hermes-sky fixed inset-0 flex items-center justify-center overflow-hidden">
      <BackgroundShapes />

      {/* Letter hero — top-left */}
      <div className="fixed top-5 left-5" style={{ zIndex: 10 }}>
        <LetterDisplay />
      </div>

      {/* Canvas (centered) — JourneyProgress is rendered inside TracingCanvas as fixed top-right */}
      <div className="relative" style={{ zIndex: 5 }}>
        <TracingCanvas />
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-6 left-6" style={{ zIndex: 10 }}>
        <ClearButton />
      </div>
      <div className="fixed bottom-6 right-6" style={{ zIndex: 10 }}>
        <ParentControls />
      </div>
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
