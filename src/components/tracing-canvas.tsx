"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useTracingStore } from "@/store/tracing-store";
import { useDrawing } from "@/hooks/use-drawing";
import { useCoverage } from "@/hooks/use-coverage";
import { useHighDpiCanvas } from "@/hooks/use-high-dpi-canvas";
import { renderGuideLetter, renderRuledLines } from "@/lib/pixel-mask";
import { renderStroke, DEFAULT_STROKE_OPTIONS } from "@/lib/stroke-renderer";
import { loadFont } from "@/lib/fonts";
import { JourneyProgress } from "@/components/journey-progress";
import { Celebration } from "@/components/celebration";
import { ALL_CHARS, getRoundConfig } from "@/types";

const CANVAS_SIZE = 500;

interface CelebrationEvent {
  type: "round" | "letter";
  stateKey: string;
}

export function TracingCanvas() {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZE);

  const currentChar = useTracingStore((s) => s.currentChar);
  const settings = useTracingStore((s) => s.settings);
  const progress = useTracingStore((s) => s.progress);
  const markLetterCompleted = useTracingStore((s) => s.markLetterCompleted);
  const completeRound = useTracingStore((s) => s.completeRound);
  const advanceToNext = useTracingStore((s) => s.advanceToNext);
  const setCurrentChar = useTracingStore((s) => s.setCurrentChar);

  const letterProgress = progress[currentChar] || {
    completed: false,
    strokes: [],
    currentRound: 0,
    completedRounds: 0,
  };

  const roundConfig = getRoundConfig(settings.difficulty, letterProgress.currentRound);
  const coverageThreshold = roundConfig.threshold;

  const { setupCanvas } = useHighDpiCanvas();
  const { coverage, generateMask, checkCoverage, resetCoverage } = useCoverage({
    drawingCanvasRef,
    maskCanvasRef,
  });

  const [celebrationEvent, setCelebrationEvent] = useState<CelebrationEvent | null>(null);

  const isLastChar = currentChar === ALL_CHARS[ALL_CHARS.length - 1];

  // Snapshot key captures all state that should invalidate a celebration
  const stateKey = `${currentChar}-${letterProgress.currentRound}-${settings.difficulty}-${canvasSize}-${settings.fontFamily}-${settings.fontSize}-${settings.fontWeight}`;

  // Track stroke count to detect clears
  const currentStrokes = progress[currentChar]?.strokes;
  const strokeCount = currentStrokes?.length ?? 0;

  // Derive celebration visibility: auto-dismisses when state changes or strokes are cleared
  const celebrationType =
    celebrationEvent !== null &&
    celebrationEvent.stateKey === stateKey &&
    strokeCount > 0
      ? celebrationEvent.type
      : null;

  // Calculate responsive canvas size
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxSize = Math.min(vw - 32, vh - 80, 700);
      setCanvasSize(Math.max(300, maxSize));
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Initialize canvases
  const initCanvases = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!drawingCanvas || !guideCanvas || !maskCanvas) return;

    setupCanvas(drawingCanvas, canvasSize, canvasSize);

    const dpr = window.devicePixelRatio || 1;
    guideCanvas.width = canvasSize * dpr;
    guideCanvas.height = canvasSize * dpr;
    guideCanvas.style.width = `${canvasSize}px`;
    guideCanvas.style.height = `${canvasSize}px`;

    maskCanvas.width = canvasSize * dpr;
    maskCanvas.height = canvasSize * dpr;
    maskCanvas.style.width = `${canvasSize}px`;
    maskCanvas.style.height = `${canvasSize}px`;
  }, [canvasSize, setupCanvas]);

  // Load font and render letter
  const renderLetter = useCallback(async () => {
    await loadFont(settings.fontFamily, settings.fontWeight);

    initCanvases();

    const guideCanvas = guideCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!guideCanvas || !maskCanvas) return;

    renderGuideLetter(
      guideCanvas,
      currentChar,
      settings.fontFamily,
      settings.fontSize,
      settings.fontWeight,
      roundConfig.guideOpacity
    );

    if (roundConfig.showRuledLines) {
      renderRuledLines(
        guideCanvas,
        settings.fontFamily,
        settings.fontSize,
        settings.fontWeight
      );
    }

    generateMask(
      currentChar,
      settings.fontFamily,
      settings.fontSize,
      settings.fontWeight
    );
  }, [
    currentChar,
    settings.fontFamily,
    settings.fontSize,
    settings.fontWeight,
    roundConfig.guideOpacity,
    roundConfig.showRuledLines,
    initCanvases,
    generateMask,
  ]);

  // Re-render when letter, settings, or round changes
  useEffect(() => {
    resetCoverage();
    renderLetter().then(() => {
      const { progress: latestProgress } = useTracingStore.getState();

      // Restore strokes from store onto drawing canvas
      const canvas = drawingCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
          const lp = latestProgress[currentChar];
          if (lp?.strokes) {
            for (const stroke of lp.strokes) {
              renderStroke(ctx, stroke.points, stroke.color, {
                size: stroke.size,
                thinning: stroke.thinning,
                smoothing: DEFAULT_STROKE_OPTIONS.smoothing,
                streamline: DEFAULT_STROKE_OPTIONS.streamline,
                simulatePressure: stroke.simulatePressure,
              });
            }
          }
        }
      }

      // Check existing coverage
      if (latestProgress[currentChar]?.strokes?.length) {
        const cov = checkCoverage();
        if (cov >= coverageThreshold) {
          setCelebrationEvent({
            type: roundConfig.isLastRound ? "letter" : "round",
            stateKey,
          });
        }
      }
    });
  }, [resetCoverage, renderLetter, currentChar, checkCoverage, coverageThreshold, roundConfig.isLastRound, stateKey]);

  // React to clear: when strokes drop to 0, wipe the drawing canvas and reset coverage
  useEffect(() => {
    if (strokeCount === 0) {
      const canvas = drawingCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        }
      }
      resetCoverage();
    }
  }, [strokeCount, resetCoverage]);

  // Handle stroke completion — check coverage
  const onStrokeEnd = useCallback(() => {
    const cov = checkCoverage();
    if (cov >= coverageThreshold && !celebrationType) {
      if (roundConfig.isLastRound) {
        markLetterCompleted();
      }
      setCelebrationEvent({
        type: roundConfig.isLastRound ? "letter" : "round",
        stateKey,
      });
    }
  }, [checkCoverage, coverageThreshold, celebrationType, markLetterCompleted, roundConfig.isLastRound, stateKey]);

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDrawing({
    canvasRef: drawingCanvasRef,
    onStrokeEnd,
  });

  const handleNext = useCallback(() => {
    setCelebrationEvent(null);
    if (celebrationType === "round") {
      completeRound();
    } else if (isLastChar) {
      setCurrentChar("COMPLETED");
    } else {
      advanceToNext();
    }
  }, [celebrationType, completeRound, advanceToNext, isLastChar, setCurrentChar]);

  // Touch event prevention for Safari scroll — bound once after mount
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const preventTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("touchstart", preventTouch, { passive: false });
    canvas.addEventListener("touchmove", preventTouch, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", preventTouch);
      canvas.removeEventListener("touchmove", preventTouch);
    };
  }, []);

  return (
    <>
      {/* Star progress — fixed top-right */}
      <div className="fixed top-5 right-5" style={{ zIndex: 10 }}>
        <JourneyProgress coverage={coverage} threshold={coverageThreshold} />
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="hermes-canvas-surface relative overflow-hidden"
        style={{ width: canvasSize, height: canvasSize }}
      >
        {/* Mask canvas — hidden, used for pixel comparison */}
        <canvas
          ref={maskCanvasRef}
          className="absolute inset-0 invisible"
        />

        {/* Guide canvas — faded letter */}
        <canvas
          ref={guideCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 20 }}
        />

        {/* Drawing canvas — user strokes */}
        <canvas
          ref={drawingCanvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{ zIndex: 30, touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* Celebration — full viewport, rendered outside canvas container */}
      <Celebration
        show={celebrationType !== null}
        celebrationType={celebrationType ?? "letter"}
        onNext={handleNext}
        isLastChar={isLastChar}
      />
    </>
  );
}
