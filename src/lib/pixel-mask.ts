import { getFontString } from "./fonts";

const ALPHA_THRESHOLD = 10;

/**
 * Generate a binary mask of the letter pixels.
 * Returns a Uint8Array where 1 = letter pixel, 0 = background.
 */
export function generateLetterMask(
  canvas: HTMLCanvasElement,
  char: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: number
): { mask: Uint8Array; totalPixels: number } {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const width = canvas.width;
  const height = canvas.height;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Draw letter in solid black
  ctx.fillStyle = "#000000";
  ctx.font = getFontString(fontFamily, fontWeight, fontSize * (window.devicePixelRatio || 1));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, width / 2, height / 2);

  // Extract pixel data
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const mask = new Uint8Array(width * height);
  let totalPixels = 0;

  for (let i = 0; i < mask.length; i++) {
    const alpha = pixels[i * 4 + 3]; // Alpha channel
    if (alpha > ALPHA_THRESHOLD) {
      mask[i] = 1;
      totalPixels++;
    }
  }

  return { mask, totalPixels };
}

/**
 * Render the guide letter (faded) on the guide canvas.
 * Pass opacity 0 to skip rendering (Advanced mode uses ruled lines instead).
 */
export function renderGuideLetter(
  canvas: HTMLCanvasElement,
  char: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: number,
  opacity: number = 0.15
): void {
  const ctx = canvas.getContext("2d")!;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  if (opacity <= 0) return;

  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.font = getFontString(fontFamily, fontWeight, fontSize * (window.devicePixelRatio || 1));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, width / 2, height / 2);
}

/**
 * Render ruled lines (baseline, midline, cap-height) for Advanced mode.
 * Uses font metrics to position lines relative to the center.
 */
export function renderRuledLines(
  canvas: HTMLCanvasElement,
  fontFamily: string,
  fontSize: number,
  fontWeight: number
): void {
  const ctx = canvas.getContext("2d")!;
  const width = canvas.width;
  const height = canvas.height;
  const dpr = window.devicePixelRatio || 1;

  // Measure font metrics using the same font string as guide/mask
  ctx.font = getFontString(fontFamily, fontWeight, fontSize * dpr);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText("H");

  const centerY = height / 2;
  const ascent = metrics.actualBoundingBoxAscent;
  const descent = metrics.actualBoundingBoxDescent;

  const baseline = centerY + descent;
  const capHeight = centerY - ascent;
  const midline = (baseline + capHeight) / 2;

  // Baseline — solid
  ctx.strokeStyle = "rgba(0, 0, 0, 0.10)";
  ctx.lineWidth = 2 * dpr;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(0, baseline);
  ctx.lineTo(width, baseline);
  ctx.stroke();

  // Cap-height — dashed
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1.5 * dpr;
  ctx.setLineDash([8 * dpr, 6 * dpr]);
  ctx.beginPath();
  ctx.moveTo(0, capHeight);
  ctx.lineTo(width, capHeight);
  ctx.stroke();

  // Midline — dashed
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1.5 * dpr;
  ctx.setLineDash([8 * dpr, 6 * dpr]);
  ctx.beginPath();
  ctx.moveTo(0, midline);
  ctx.lineTo(width, midline);
  ctx.stroke();

  ctx.setLineDash([]);
}

/**
 * Calculate coverage by comparing drawing canvas pixels against the mask.
 * Uses sampled comparison (every 4th pixel) for performance.
 */
export function calculateCoverage(
  drawingCanvas: HTMLCanvasElement,
  mask: Uint8Array,
  totalMaskPixels: number
): number {
  if (totalMaskPixels === 0) return 0;

  const ctx = drawingCanvas.getContext("2d", { willReadFrequently: true })!;
  const width = drawingCanvas.width;
  const height = drawingCanvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let coveredSampled = 0;
  let totalSampled = 0;
  const step = 4; // Sample every 4th pixel

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        totalSampled++;
        const alpha = pixels[idx * 4 + 3];
        if (alpha > ALPHA_THRESHOLD) {
          coveredSampled++;
        }
      }
    }
  }

  if (totalSampled === 0) return 0;
  return coveredSampled / totalSampled;
}
