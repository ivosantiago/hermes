"use client";

import { useState } from "react";
import { useTracingStore } from "@/store/tracing-store";
import { Button } from "@/components/ui/button";
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

const STROKE_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Black", value: "#1f2937" },
];

export function ParentControls() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useTracingStore((s) => s.settings);
  const updateSettings = useTracingStore((s) => s.updateSettings);
  const clearCurrentStrokes = useTracingStore((s) => s.clearCurrentStrokes);
  const setCurrentChar = useTracingStore((s) => s.setCurrentChar);
  const currentChar = useTracingStore((s) => s.currentChar);
  const progress = useTracingStore((s) => s.progress);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-amber-700 hover:text-amber-900 hover:bg-amber-100"
      >
        {isOpen ? "Hide Controls ▲" : "Parent Controls ▼"}
      </Button>

      {isOpen && (
        <div className="mt-2 p-4 bg-white rounded-xl border border-amber-200 shadow-md space-y-5">
          {/* Font picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Font</label>
            <Select
              value={settings.fontFamily}
              onValueChange={(v) => updateSettings({ fontFamily: v })}
            >
              <SelectTrigger className="w-full">
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
            <label className="text-sm font-medium text-gray-700">
              Letter Size: {settings.fontSize}px
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
            <label className="text-sm font-medium text-gray-700">
              Font Weight: {settings.fontWeight}
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
            <label className="text-sm font-medium text-gray-700">
              Stroke Size: {settings.strokeSize}
            </label>
            <Slider
              value={[settings.strokeSize]}
              onValueChange={([v]) => updateSettings({ strokeSize: v })}
              min={8}
              max={40}
              step={2}
            />
          </div>

          {/* Stroke color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Stroke Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {STROKE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ strokeColor: color.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    settings.strokeColor === color.value
                      ? "border-gray-800 scale-125"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Jump to Letter
            </label>
            <div className="flex gap-1 mb-2">
              {(
                [
                  ["uppercase", "A-Z"],
                  ["lowercase", "a-z"],
                  ["numbers", "0-9"],
                ] as const
              ).map(([cat, label]) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="flex-1"
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              {categoryChars.map((char) => {
                const isCompleted = progress[char]?.completed;
                const isCurrent = char === currentChar;
                return (
                  <button
                    key={char}
                    onClick={() => setCurrentChar(char)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                      isCurrent
                        ? "bg-amber-500 text-white shadow-md scale-110"
                        : isCompleted
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={clearCurrentStrokes}
              className="flex-1"
            >
              Clear Drawing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
