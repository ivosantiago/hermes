import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Stroke,
  PersistedState,
  AppSettings,
  LetterProgress,
  DifficultyLevel,
  Locale,
} from "@/types";
import { DEFAULT_SETTINGS, ALL_CHARS, DIFFICULTY_CONFIGS } from "@/types";

const DEFAULT_PROGRESS: LetterProgress = {
  completed: false,
  strokes: [],
  currentRound: 0,
  completedRounds: 0,
};

// V1 persisted state shape (before difficulty levels)
interface V1LetterProgress {
  completed: boolean;
  strokes: Stroke[];
}

interface V1Settings {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  strokeColor: string;
  strokeSize: number;
  coverageThreshold: number;
  locale: Locale;
}

interface V1PersistedState {
  currentChar: string;
  progress: Record<string, V1LetterProgress>;
  settings: V1Settings;
}

function isV1PersistedState(value: unknown): value is V1PersistedState {
  return (
    typeof value === "object" &&
    value !== null &&
    "currentChar" in value &&
    "progress" in value &&
    "settings" in value
  );
}

function isPartialPersistedState(
  value: unknown
): value is Partial<PersistedState> {
  return typeof value === "object" && value !== null;
}

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
  completeRound: () => void;
  setDifficulty: (level: DifficultyLevel) => void;
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
        const existing = progress[currentChar] || { ...DEFAULT_PROGRESS };
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
              [currentChar]: {
                ...existing,
                strokes: [],
                completed: false,
              },
            },
          });
        }
      },

      markLetterCompleted: () => {
        const { currentChar, progress, settings } = get();
        const config = DIFFICULTY_CONFIGS[settings.difficulty];
        const existing = progress[currentChar] || { ...DEFAULT_PROGRESS };
        set({
          progress: {
            ...progress,
            [currentChar]: {
              ...existing,
              completed: true,
              completedRounds: config.rounds,
            },
          },
        });
      },

      completeRound: () => {
        const { currentChar, progress, settings } = get();
        const config = DIFFICULTY_CONFIGS[settings.difficulty];
        const existing = progress[currentChar] || { ...DEFAULT_PROGRESS };
        const newCompletedRounds = existing.completedRounds + 1;

        if (newCompletedRounds >= config.rounds) {
          set({
            progress: {
              ...progress,
              [currentChar]: {
                ...existing,
                completed: true,
                completedRounds: newCompletedRounds,
                currentRound: existing.currentRound,
              },
            },
          });
        } else {
          set({
            progress: {
              ...progress,
              [currentChar]: {
                ...existing,
                strokes: [],
                completedRounds: newCompletedRounds,
                currentRound: newCompletedRounds,
              },
            },
          });
        }
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

      setDifficulty: (level: DifficultyLevel) => {
        const { settings, progress } = get();
        const config = DIFFICULTY_CONFIGS[level];
        const newProgress = { ...progress };

        for (const char of Object.keys(newProgress)) {
          const lp = newProgress[char];
          if (!lp.completed && lp.completedRounds >= config.rounds) {
            newProgress[char] = { ...lp, completed: true };
          }
        }

        set({
          settings: {
            ...settings,
            difficulty: level,
            strokeSize: config.defaultStrokeSize,
          },
          progress: newProgress,
        });
      },

      resetProgress: () => {
        set({ currentChar: "A", progress: {} });
      },

      getLetterProgress: (char: string) => {
        return get().progress[char] || { ...DEFAULT_PROGRESS };
      },

      isAllCompleted: () => {
        const { progress } = get();
        return ALL_CHARS.every((c) => progress[c]?.completed);
      },
    }),
    {
      name: "hermes-tracing",
      version: 2,
      skipHydration: true,
      migrate: (persisted, version) => {
        if (version === 1 && isV1PersistedState(persisted)) {
          const newProgress: Record<string, LetterProgress> = {};

          for (const [char, lp] of Object.entries(persisted.progress)) {
            newProgress[char] = {
              completed: lp.completed,
              strokes: lp.strokes,
              currentRound: 0,
              completedRounds: lp.completed ? 1 : 0,
            };
          }

          const difficulty: DifficultyLevel = "beginner";

          return {
            currentChar: persisted.currentChar,
            progress: newProgress,
            settings: {
              fontFamily: persisted.settings.fontFamily,
              fontSize: persisted.settings.fontSize,
              fontWeight: persisted.settings.fontWeight,
              strokeColor: persisted.settings.strokeColor,
              strokeSize: persisted.settings.strokeSize,
              locale: persisted.settings.locale,
              difficulty,
            },
          };
        }
        return persisted;
      },
      merge: (persisted, current) => {
        if (!isPartialPersistedState(persisted)) return current;
        return {
          ...current,
          ...persisted,
          settings: { ...DEFAULT_SETTINGS, ...persisted.settings },
        };
      },
    }
  )
);
