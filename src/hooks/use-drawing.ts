"use client";

import { useRef, useCallback } from "react";
import type { StrokePoint, Stroke } from "@/types";
import {
  renderStroke,
  renderLiveStroke,
  DEFAULT_STROKE_OPTIONS,
} from "@/lib/stroke-renderer";
import { useTracingStore } from "@/store/tracing-store";

interface UseDrawingOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onStrokeEnd?: () => void;
}

export function useDrawing({ canvasRef, onStrokeEnd }: UseDrawingOptions) {
  const pointsRef = useRef<StrokePoint[]>([]);
  const isDrawingRef = useRef(false);
  const strokeStartTimeRef = useRef(0);
  const pointerTypeRef = useRef<string>("mouse");

  const settings = useTracingStore((s) => s.settings);
  const addStroke = useTracingStore((s) => s.addStroke);

  const getCanvasPoint = useCallback(
    (e: React.PointerEvent): StrokePoint => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0, 0.5];
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pressure = e.pressure || 0.5;
      return [x, y, pressure];
    },
    [canvasRef]
  );

  const redrawAllStrokes = useCallback(
    (strokes: Stroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      for (const stroke of strokes) {
        renderStroke(ctx, stroke.points, stroke.color, {
          size: stroke.size,
          thinning: stroke.thinning,
          smoothing: DEFAULT_STROKE_OPTIONS.smoothing,
          streamline: DEFAULT_STROKE_OPTIONS.streamline,
          simulatePressure: stroke.simulatePressure,
        });
      }
    },
    [canvasRef]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only respond to primary pointer
      if (e.button !== 0) return;

      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      isDrawingRef.current = true;
      strokeStartTimeRef.current = Date.now();
      pointerTypeRef.current = e.pointerType;
      pointsRef.current = [getCanvasPoint(e)];
    },
    [getCanvasPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();

      const point = getCanvasPoint(e);
      pointsRef.current.push(point);

      // Live render
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get existing strokes from store
      const progress = useTracingStore.getState().progress;
      const currentChar = useTracingStore.getState().currentChar;
      const existingStrokes = progress[currentChar]?.strokes || [];

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Redraw completed strokes
      for (const stroke of existingStrokes) {
        renderStroke(ctx, stroke.points, stroke.color, {
          size: stroke.size,
          thinning: stroke.thinning,
          smoothing: DEFAULT_STROKE_OPTIONS.smoothing,
          streamline: DEFAULT_STROKE_OPTIONS.streamline,
          simulatePressure: stroke.simulatePressure,
        });
      }

      // Draw live stroke
      const simulatePressure = pointerTypeRef.current !== "pen";
      renderLiveStroke(ctx, pointsRef.current, settings.strokeColor, {
        size: settings.strokeSize,
        thinning: DEFAULT_STROKE_OPTIONS.thinning,
        smoothing: DEFAULT_STROKE_OPTIONS.smoothing,
        streamline: DEFAULT_STROKE_OPTIONS.streamline,
        simulatePressure,
      });
    },
    [canvasRef, getCanvasPoint, settings.strokeColor, settings.strokeSize]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      isDrawingRef.current = false;

      const points = pointsRef.current;
      const duration = Date.now() - strokeStartTimeRef.current;

      // Filter Apple Pencil artifacts: too few points or too short duration
      if (points.length < 3 || duration < 50) {
        // Redraw without the artifact
        const progress = useTracingStore.getState().progress;
        const currentChar = useTracingStore.getState().currentChar;
        const existingStrokes = progress[currentChar]?.strokes || [];
        redrawAllStrokes(existingStrokes);
        pointsRef.current = [];
        return;
      }

      const simulatePressure = pointerTypeRef.current !== "pen";
      const stroke: Stroke = {
        points: [...points],
        color: settings.strokeColor,
        size: settings.strokeSize,
        thinning: DEFAULT_STROKE_OPTIONS.thinning,
        simulatePressure,
      };

      addStroke(stroke);
      pointsRef.current = [];

      // Final render of completed stroke
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const progress = useTracingStore.getState().progress;
          const currentChar = useTracingStore.getState().currentChar;
          const allStrokes = progress[currentChar]?.strokes || [];
          redrawAllStrokes(allStrokes);
        }
      }

      onStrokeEnd?.();
    },
    [
      addStroke,
      canvasRef,
      onStrokeEnd,
      redrawAllStrokes,
      settings.strokeColor,
      settings.strokeSize,
    ]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    redrawAllStrokes,
  };
}
