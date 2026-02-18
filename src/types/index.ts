export type StrokePoint = [x: number, y: number, pressure: number];

export interface Stroke {
  points: StrokePoint[];
  color: string;
  size: number;
  thinning: number;
  simulatePressure: boolean;
}

export type CharCategory = "uppercase" | "lowercase" | "numbers";

export interface LetterProgress {
  completed: boolean;
  strokes: Stroke[];
}

export type { Locale } from "@/lib/i18n";

export interface AppSettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  strokeColor: string;
  strokeSize: number;
  coverageThreshold: number;
  locale: import("@/lib/i18n").Locale;
}

export interface PersistedState {
  currentChar: string;
  progress: Record<string, LetterProgress>;
  settings: AppSettings;
}

export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");
export const NUMBERS = "0123456789".split("");
export const ALL_CHARS = [...UPPERCASE, ...LOWERCASE, ...NUMBERS];

export function getCategory(char: string): CharCategory {
  if (char >= "A" && char <= "Z") return "uppercase";
  if (char >= "a" && char <= "z") return "lowercase";
  return "numbers";
}

export function getCharsForCategory(category: CharCategory): string[] {
  switch (category) {
    case "uppercase":
      return UPPERCASE;
    case "lowercase":
      return LOWERCASE;
    case "numbers":
      return NUMBERS;
  }
}

export function getNextChar(current: string): string | null {
  const idx = ALL_CHARS.indexOf(current);
  if (idx === -1 || idx === ALL_CHARS.length - 1) return null;
  return ALL_CHARS[idx + 1];
}

export const DEFAULT_SETTINGS: AppSettings = {
  fontFamily: "Caveat",
  fontSize: 300,
  fontWeight: 400,
  strokeColor: "#3b82f6",
  strokeSize: 20,
  coverageThreshold: 0.9,
  locale: "pt-BR",
};

export type FontCategory = "handwriting" | "sans-serif" | "serif" | "display";

export interface CuratedFont {
  name: string;
  value: string;
  category: FontCategory;
}

export const CURATED_FONTS: CuratedFont[] = [
  // Handwriting
  { name: "Caveat", value: "Caveat", category: "handwriting" },
  { name: "Dancing Script", value: "Dancing Script", category: "handwriting" },
  { name: "Patrick Hand", value: "Patrick Hand", category: "handwriting" },
  { name: "Pacifico", value: "Pacifico", category: "handwriting" },
  { name: "Satisfy", value: "Satisfy", category: "handwriting" },
  { name: "Kalam", value: "Kalam", category: "handwriting" },
  { name: "Indie Flower", value: "Indie Flower", category: "handwriting" },
  { name: "Shadows Into Light", value: "Shadows Into Light", category: "handwriting" },
  // Sans Serif
  { name: "Nunito", value: "Nunito", category: "sans-serif" },
  { name: "Quicksand", value: "Quicksand", category: "sans-serif" },
  { name: "Comfortaa", value: "Comfortaa", category: "sans-serif" },
  { name: "Baloo 2", value: "Baloo 2", category: "sans-serif" },
  { name: "Fredoka", value: "Fredoka", category: "sans-serif" },
  { name: "Bubblegum Sans", value: "Bubblegum Sans", category: "sans-serif" },
  // Serif
  { name: "Noto Serif", value: "Noto Serif", category: "serif" },
  { name: "Lora", value: "Lora", category: "serif" },
  { name: "Playfair Display", value: "Playfair Display", category: "serif" },
  { name: "Merriweather", value: "Merriweather", category: "serif" },
  { name: "Crimson Text", value: "Crimson Text", category: "serif" },
  // Display
  { name: "Bungee", value: "Bungee", category: "display" },
  { name: "Righteous", value: "Righteous", category: "display" },
  { name: "Concert One", value: "Concert One", category: "display" },
  { name: "Titan One", value: "Titan One", category: "display" },
  { name: "Lilita One", value: "Lilita One", category: "display" },
];
