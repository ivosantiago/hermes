"use client";

import { useState, useCallback } from "react";
import { useTracingStore } from "@/store/tracing-store";
import { useTranslation } from "@/hooks/use-translation";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AVAILABLE_FONTS,
  UPPERCASE,
  LOWERCASE,
  NUMBERS,
  type CharCategory,
} from "@/types";
import type { TranslationKey } from "@/lib/i18n";

const STROKE_COLORS: { nameKey: TranslationKey; value: string }[] = [
  { nameKey: "color.coral", value: "#FF6B6B" },
  { nameKey: "color.blue", value: "#3b82f6" },
  { nameKey: "color.teal", value: "#4ECDC4" },
  { nameKey: "color.purple", value: "#A78BFA" },
  { nameKey: "color.orange", value: "#FB923C" },
  { nameKey: "color.pink", value: "#F472B6" },
  { nameKey: "color.navy", value: "#1a1a2e" },
];

export function ParentControls() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useTracingStore((s) => s.settings);
  const updateSettings = useTracingStore((s) => s.updateSettings);
  const setCurrentChar = useTracingStore((s) => s.setCurrentChar);
  const currentChar = useTracingStore((s) => s.currentChar);
  const progress = useTracingStore((s) => s.progress);
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<CharCategory>(() => {
    if (currentChar >= "A" && currentChar <= "Z") return "uppercase";
    if (currentChar >= "a" && currentChar <= "z") return "lowercase";
    return "numbers";
  });

  const categoryChars =
    activeCategory === "uppercase"
      ? UPPERCASE
      : activeCategory === "lowercase"
        ? LOWERCASE
        : NUMBERS;

  const handleLetterSelect = useCallback(
    (char: string) => {
      setCurrentChar(char);
      setIsOpen(false);
    },
    [setCurrentChar]
  );

  return (
    <>
      {/* Gear trigger — fixed bottom-right */}
      <button
        onClick={() => setIsOpen(true)}
        className="hermes-fab"
        aria-label={t("settings.ariaLabel")}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Bottom sheet */}
      {isOpen && (
        <>
          {/* Scrim */}
          <div
            className="hermes-bottom-sheet-scrim"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="hermes-bottom-sheet">
            {/* Drag handle */}
            <div className="hermes-bottom-sheet-handle" />

            <div className="p-5 space-y-5">
              {/* Font picker */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--hermes-navy-light)", opacity: 0.6 }}>
                  {t("settings.font")}
                </label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(v) => updateSettings({ fontFamily: v })}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font size */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--hermes-navy-light)", opacity: 0.6 }}>
                  {t("settings.size", { value: settings.fontSize })}
                </label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([v]) => updateSettings({ fontSize: v })}
                  min={100}
                  max={400}
                  step={10}
                />
              </div>

              {/* Font weight */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--hermes-navy-light)", opacity: 0.6 }}>
                  {t("settings.weight", { value: settings.fontWeight })}
                </label>
                <Slider
                  value={[settings.fontWeight]}
                  onValueChange={([v]) => updateSettings({ fontWeight: v })}
                  min={100}
                  max={900}
                  step={100}
                />
              </div>

              {/* Stroke size */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--hermes-navy-light)", opacity: 0.6 }}>
                  {t("settings.brush", { value: settings.strokeSize })}
                </label>
                <Slider
                  value={[settings.strokeSize]}
                  onValueChange={([v]) => updateSettings({ strokeSize: v })}
                  min={8}
                  max={40}
                  step={2}
                />
              </div>

              {/* Coverage threshold */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--hermes-navy-light)", opacity: 0.6 }}>
                  {t("settings.goal", { value: Math.round(settings.coverageThreshold * 100) })}
                </label>
                <Slider
                  value={[settings.coverageThreshold]}
                  onValueChange={([v]) => updateSettings({ coverageThreshold: v })}
                  min={0.5}
                  max={1.0}
                  step={0.05}
                />
              </div>

              {/* Stroke color */}
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--hermes-navy-light)", opacity: 0.6 }}>
                  {t("settings.color")}
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {STROKE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateSettings({ strokeColor: color.value })}
                      className={`hermes-color-swatch w-9 h-9 ${
                        settings.strokeColor === color.value ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={t(color.nameKey)}
                    />
                  ))}
                </div>
              </div>

              {/* Category tabs + letter grid */}
              <div className="space-y-2">
                <label className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--hermes-navy-light)", opacity: 0.6 }}>
                  {t("settings.jumpToLetter")}
                </label>
                <div className="flex gap-1.5 mb-2">
                  {(
                    [
                      ["uppercase", "A\u2013Z"],
                      ["lowercase", "a\u2013z"],
                      ["numbers", "0\u20139"],
                    ] as const
                  ).map(([cat, label]) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`hermes-tab flex-1 py-2 text-sm ${
                        activeCategory === cat ? "active" : "inactive"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {categoryChars.map((char) => {
                    const isCompleted = progress[char]?.completed;
                    const isCurrent = char === currentChar;
                    return (
                      <button
                        key={char}
                        onClick={() => handleLetterSelect(char)}
                        className={`hermes-letter-tile w-9 h-9 text-sm ${
                          isCurrent
                            ? "current"
                            : isCompleted
                              ? "completed"
                              : "pending"
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language — subtle flag toggle at bottom */}
              <div className="flex items-center justify-end gap-1 pt-2">
                <button
                  onClick={() => updateSettings({ locale: "pt-BR" })}
                  className={`text-lg leading-none rounded-full p-1 transition-opacity ${
                    settings.locale === "pt-BR" ? "opacity-100" : "opacity-30"
                  }`}
                  aria-label="Português"
                >
                  &#127463;&#127479;
                </button>
                <button
                  onClick={() => updateSettings({ locale: "en" })}
                  className={`text-lg leading-none rounded-full p-1 transition-opacity ${
                    settings.locale === "en" ? "opacity-100" : "opacity-30"
                  }`}
                  aria-label="English"
                >
                  &#127482;&#127480;
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
