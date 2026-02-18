"use client";

import { useCallback } from "react";

/**
 * Returns a function that sets up a canvas for high-DPI (Retina) rendering.
 * Call this whenever the canvas needs to be initialized or resized.
 */
export function useHighDpiCanvas() {
  const setupCanvas = useCallback(
    (
      canvas: HTMLCanvasElement,
      width: number,
      height: number
    ): CanvasRenderingContext2D | null => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      return ctx;
    },
    []
  );

  return { setupCanvas };
}
