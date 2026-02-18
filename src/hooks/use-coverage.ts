"use client";

import { useRef, useCallback, useState } from "react";
import { generateLetterMask, calculateCoverage } from "@/lib/pixel-mask";

interface UseCoverageOptions {
  drawingCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useCoverage({
  drawingCanvasRef,
  maskCanvasRef,
}: UseCoverageOptions) {
  const maskRef = useRef<Uint8Array | null>(null);
  const totalPixelsRef = useRef(0);
  const [coverage, setCoverage] = useState(0);

  const generateMask = useCallback(
    (char: string, fontFamily: string, fontSize: number, fontWeight: number) => {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;

      const result = generateLetterMask(
        maskCanvas,
        char,
        fontFamily,
        fontSize,
        fontWeight
      );
      maskRef.current = result.mask;
      totalPixelsRef.current = result.totalPixels;
      setCoverage(0);
    },
    [maskCanvasRef]
  );

  const checkCoverage = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    const mask = maskRef.current;
    if (!drawingCanvas || !mask) return 0;

    const cov = calculateCoverage(drawingCanvas, mask, totalPixelsRef.current);
    setCoverage(cov);
    return cov;
  }, [drawingCanvasRef]);

  const resetCoverage = useCallback(() => {
    setCoverage(0);
  }, []);

  return {
    coverage,
    generateMask,
    checkCoverage,
    resetCoverage,
  };
}
