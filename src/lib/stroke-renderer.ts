import getStroke from "perfect-freehand";
import type { StrokePoint } from "@/types";

export interface StrokeOptions {
  size: number;
  thinning: number;
  smoothing: number;
  streamline: number;
  simulatePressure: boolean;
}

export const DEFAULT_STROKE_OPTIONS: StrokeOptions = {
  size: 20,
  thinning: 0.7,
  smoothing: 0.5,
  streamline: 0.4,
  simulatePressure: true,
};

function average(a: number, b: number): number {
  return (a + b) / 2;
}

/**
 * Convert perfect-freehand outline points to an SVG path string.
 * This generates a smooth filled polygon path.
 */
export function getSvgPathFromStroke(points: number[][]): string {
  const len = points.length;
  if (len < 4) return "";

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

  for (let i = 2; i < len - 1; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }

  result += "Z";
  return result;
}

/**
 * Render a stroke from points onto a canvas context.
 */
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  points: StrokePoint[],
  color: string,
  options: StrokeOptions
): void {
  if (points.length < 2) return;

  const outlinePoints = getStroke(points, {
    size: options.size,
    thinning: options.thinning,
    smoothing: options.smoothing,
    streamline: options.streamline,
    simulatePressure: options.simulatePressure,
  });

  const pathData = getSvgPathFromStroke(outlinePoints);
  if (!pathData) return;

  const path = new Path2D(pathData);
  ctx.fillStyle = color;
  ctx.fill(path);
}

/**
 * Render a stroke with live (in-progress) points for real-time feedback.
 */
export function renderLiveStroke(
  ctx: CanvasRenderingContext2D,
  points: StrokePoint[],
  color: string,
  options: StrokeOptions
): void {
  if (points.length < 2) return;

  const outlinePoints = getStroke(points, {
    size: options.size,
    thinning: options.thinning,
    smoothing: options.smoothing,
    streamline: options.streamline,
    simulatePressure: options.simulatePressure,
    last: false, // Still drawing
  });

  const pathData = getSvgPathFromStroke(outlinePoints);
  if (!pathData) return;

  const path = new Path2D(pathData);
  ctx.fillStyle = color;
  ctx.fill(path);
}
