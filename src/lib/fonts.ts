import { CURATED_FONTS } from "@/types";

const loadedFonts = new Set<string>();

export async function loadFont(
  family: string,
  weight: number = 400
): Promise<void> {
  const key = `${family}:${weight}`;
  if (loadedFonts.has(key)) return;

  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);

  // Wait for the font to be available
  try {
    await document.fonts.load(`${weight} 48px "${family}"`);
    await document.fonts.ready;
    loadedFonts.add(key);
  } catch {
    // Font may still load via stylesheet, wait a bit
    await new Promise((r) => setTimeout(r, 500));
    await document.fonts.ready;
    loadedFonts.add(key);
  }
}

export async function preloadAllFonts(): Promise<void> {
  const promises = CURATED_FONTS.map((f) => loadFont(f.value, 400));
  await Promise.allSettled(promises);
}

export function isFontLoaded(family: string, weight: number = 400): boolean {
  return loadedFonts.has(`${family}:${weight}`);
}

export function getFontString(
  family: string,
  weight: number,
  size: number
): string {
  return `${weight} ${size}px "${family}"`;
}
