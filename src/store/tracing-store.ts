import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Stroke,
  PersistedState,
  AppSettings,
  LetterProgress,
} from "@/types";
import { DEFAULT_SETTINGS, ALL_CHARS } from "@/types";

interface TracingActions {
  setCurrentChar: (char: string) => void;
  addStroke: (stroke: Stroke) => void;
  clearCurrentStrokes: () => void;
  markLetterCompleted: () => void;
  advanceToNext: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetProgress: () => void;
  getLetterProgress: (char: string) => LetterProgress;
  isAllCompleted: () => boolean;
}

type TracingStore = PersistedState & TracingActions;

export const useTracingStore = create<TracingStore>()(
  persist(
    (set, get) => ({
      currentChar: "A",
      progress: {},
      settings: DEFAULT_SETTINGS,

      setCurrentChar: (char: string) => {
        set({ currentChar: char });
      },

      addStroke: (stroke: Stroke) => {
        const { currentChar, progress } = get();
        const existing = progress[currentChar] || {
          completed: false,
          strokes: [],
        };
        set({
          progress: {
            ...progress,
            [currentChar]: {
              ...existing,
              strokes: [...existing.strokes, stroke],
            },
          },
        });
      },

      clearCurrentStrokes: () => {
        const { currentChar, progress } = get();
        const existing = progress[currentChar];
        if (existing) {
          set({
            progress: {
              ...progress,
              [currentChar]: { ...existing, strokes: [], completed: false },
            },
          });
        }
      },

      markLetterCompleted: () => {
        const { currentChar, progress } = get();
        const existing = progress[currentChar] || {
          completed: false,
          strokes: [],
        };
        set({
          progress: {
            ...progress,
            [currentChar]: { ...existing, completed: true },
          },
        });
      },

      advanceToNext: () => {
        const { currentChar } = get();
        const idx = ALL_CHARS.indexOf(currentChar);
        if (idx < ALL_CHARS.length - 1) {
          set({ currentChar: ALL_CHARS[idx + 1] });
        }
      },

      updateSettings: (partial: Partial<AppSettings>) => {
        const { settings } = get();
        set({ settings: { ...settings, ...partial } });
      },

      resetProgress: () => {
        set({ currentChar: "A", progress: {} });
      },

      getLetterProgress: (char: string) => {
        return (
          get().progress[char] || { completed: false, strokes: [] }
        );
      },

      isAllCompleted: () => {
        const { progress } = get();
        return ALL_CHARS.every((c) => progress[c]?.completed);
      },
    }),
    {
      name: "hermes-tracing",
      version: 1,
      skipHydration: true,
    }
  )
);
