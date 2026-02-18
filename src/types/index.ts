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
  fontFamily: "Noto Serif",
  fontSize: 300,
  fontWeight: 400,
  strokeColor: "#3b82f6",
  strokeSize: 20,
  coverageThreshold: 0.9,
  locale: "pt-BR",
};

export const AVAILABLE_FONTS = [
  { name: "Noto Serif", value: "Noto Serif" },
  { name: "Caveat", value: "Caveat" },
  { name: "Dancing Script", value: "Dancing Script" },
  { name: "Patrick Hand", value: "Patrick Hand" },
  { name: "Pacifico", value: "Pacifico" },
  { name: "Roboto Slab", value: "Roboto Slab" },
  { name: "Lora", value: "Lora" },
  { name: "Playfair Display", value: "Playfair Display" },
];
