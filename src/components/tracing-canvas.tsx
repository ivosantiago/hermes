"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useTracingStore } from "@/store/tracing-store";
import { useDrawing } from "@/hooks/use-drawing";
import { useCoverage } from "@/hooks/use-coverage";
import { useHighDpiCanvas } from "@/hooks/use-high-dpi-canvas";
import { renderGuideLetter } from "@/lib/pixel-mask";
import { renderStroke, DEFAULT_STROKE_OPTIONS } from "@/lib/stroke-renderer";
import { loadFont } from "@/lib/fonts";
import { ProgressBar } from "@/components/progress-bar";
import { Celebration } from "@/components/celebration";
import { ALL_CHARS } from "@/types";

const CANVAS_SIZE = 500;
const COVERAGE_THRESHOLD = 0.9;

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
  const advanceToNext = useTracingStore((s) => s.advanceToNext);
  const setCurrentChar = useTracingStore((s) => s.setCurrentChar);

  const { setupCanvas } = useHighDpiCanvas();
  const { coverage, generateMask, checkCoverage, resetCoverage } = useCoverage({
    drawingCanvasRef,
    maskCanvasRef,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [fontReady, setFontReady] = useState(false);

  const isLastChar = currentChar === ALL_CHARS[ALL_CHARS.length - 1];

  // Calculate responsive canvas size
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Leave room for controls and progress bar
      const maxSize = Math.min(vw - 32, vh - 280, 600);
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

    // Guide and mask canvases: raw DPR dimensions without ctx.scale,
    // because renderGuideLetter/generateLetterMask handle DPR in font size directly.
    // Only the drawing canvas needs ctx.scale for pointer coordinate mapping.
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
    setFontReady(false);
    await loadFont(settings.fontFamily, settings.fontWeight);
    setFontReady(true);

    initCanvases();

    const guideCanvas = guideCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!guideCanvas || !maskCanvas) return;

    renderGuideLetter(
      guideCanvas,
      currentChar,
      settings.fontFamily,
      settings.fontSize,
      settings.fontWeight
    );

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
    initCanvases,
    generateMask,
  ]);

  // Redraw stored strokes on the drawing canvas
  const restoreStrokes = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    const letterProgress = progress[currentChar];
    if (letterProgress?.strokes) {
      for (const stroke of letterProgress.strokes) {
        renderStroke(ctx, stroke.points, stroke.color, {
          size: stroke.size,
          thinning: stroke.thinning,
          smoothing: DEFAULT_STROKE_OPTIONS.smoothing,
          streamline: DEFAULT_STROKE_OPTIONS.streamline,
          simulatePressure: stroke.simulatePressure,
        });
      }
    }
  }, [currentChar, progress]);

  // Re-render when letter or settings change
  useEffect(() => {
    setShowCelebration(false);
    resetCoverage();
    renderLetter().then(() => {
      restoreStrokes();
      // Check existing coverage if there are strokes
      if (progress[currentChar]?.strokes?.length) {
        const cov = checkCoverage();
        if (cov >= COVERAGE_THRESHOLD) {
          setShowCelebration(true);
        }
      }
    });
  }, [currentChar, settings.fontFamily, settings.fontSize, settings.fontWeight, canvasSize]);

  // Handle stroke completion — check coverage
  const onStrokeEnd = useCallback(() => {
    const cov = checkCoverage();
    if (cov >= COVERAGE_THRESHOLD && !showCelebration) {
      markLetterCompleted();
      setShowCelebration(true);
    }
  }, [checkCoverage, markLetterCompleted, showCelebration]);

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDrawing({
    canvasRef: drawingCanvasRef,
    onStrokeEnd,
  });

  const handleNext = useCallback(() => {
    setShowCelebration(false);
    if (isLastChar) {
      // Go to completion screen
      setCurrentChar("COMPLETED");
    } else {
      advanceToNext();
    }
  }, [advanceToNext, isLastChar, setCurrentChar]);

  // Touch event prevention for Safari scroll
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
  }, [fontReady]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative rounded-2xl border-4 border-amber-200 bg-white shadow-lg overflow-hidden"
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

        {/* Celebration overlay */}
        <Celebration
          show={showCelebration}
          onNext={handleNext}
          isLastChar={isLastChar}
        />
      </div>

      <ProgressBar coverage={coverage} threshold={COVERAGE_THRESHOLD} />
    </div>
  );
}
