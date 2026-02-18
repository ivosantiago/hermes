"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";
import { CURATED_FONTS, type FontCategory } from "@/types";
import { loadFont, isFontLoaded } from "@/lib/fonts";
import { searchGoogleFonts } from "@/lib/google-fonts-api";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/i18n";

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
}

const CATEGORIES: { key: FontCategory; labelKey: TranslationKey }[] = [
  { key: "handwriting", labelKey: "font.category.handwriting" },
  { key: "sans-serif", labelKey: "font.category.sans-serif" },
  { key: "serif", labelKey: "font.category.serif" },
  { key: "display", labelKey: "font.category.display" },
];

interface FontItemProps {
  family: string;
  selected: boolean;
  onSelect: () => void;
  lazyLoad?: boolean;
}

function FontItem({ family, selected, onSelect, lazyLoad }: FontItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(() => isFontLoaded(family));

  useEffect(() => {
    if (loaded || !lazyLoad) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadFont(family).then(() => setLoaded(true));
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [family, loaded, lazyLoad]);

  // For curated fonts (not lazy), trigger load on mount if needed
  useEffect(() => {
    if (!lazyLoad && !loaded) {
      loadFont(family).then(() => setLoaded(true));
    }
  }, [family, loaded, lazyLoad]);

  const fontStyle: CSSProperties = loaded
    ? { fontFamily: `"${family}", sans-serif` }
    : {};

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className="flex items-center w-full px-3 py-2 rounded-xl transition-colors text-left"
      style={{
        background: selected
          ? "linear-gradient(135deg, var(--hermes-coral), var(--hermes-orange))"
          : "transparent",
        color: selected ? "white" : "var(--hermes-navy)",
      }}
    >
      <span
        className="flex-1 text-sm truncate"
        style={fontStyle}
      >
        {family}
      </span>
      {selected && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 ml-2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FontCategory>("handwriting");
  const [searchResults, setSearchResults] = useState<
    { family: string; category: string }[]
  >([]);
  const [searchError, setSearchError] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setSearchError(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchGoogleFonts(q);
        setSearchResults(results);
        setSearchError(false);
      } catch {
        setSearchError(true);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const isSearchMode = query.trim().length > 0;

  const filteredCurated = CURATED_FONTS.filter(
    (f) => f.category === activeCategory
  );

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--hermes-navy-light)", opacity: 0.4 }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t("font.search")}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-2 border-gray-200 outline-none transition-colors focus:border-[var(--hermes-coral)]"
          style={{ background: "white" }}
        />
      </div>

      {!isSearchMode && (
        /* Category tabs */
        <div className="flex gap-1">
          {CATEGORIES.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`hermes-tab flex-1 py-1.5 text-[11px] ${
                activeCategory === key ? "active" : "inactive"
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      )}

      {/* Font list */}
      <div
        className="overflow-y-auto space-y-0.5 rounded-xl"
        style={{
          maxHeight: 280,
          overscrollBehavior: "contain",
          background: "rgba(255,255,255,0.5)",
        }}
      >
        {isSearchMode ? (
          <>
            {searching && (
              <div
                className="text-xs text-center py-4"
                style={{ color: "var(--hermes-navy-light)", opacity: 0.5 }}
              >
                ...
              </div>
            )}
            {searchError && (
              <div
                className="text-xs text-center py-4"
                style={{ color: "var(--hermes-coral)" }}
              >
                {t("font.loadError")}
              </div>
            )}
            {!searching && !searchError && searchResults.length === 0 && (
              <div
                className="text-xs text-center py-4"
                style={{ color: "var(--hermes-navy-light)", opacity: 0.5 }}
              >
                {t("font.noResults")}
              </div>
            )}
            {searchResults.map((font) => (
              <FontItem
                key={font.family}
                family={font.family}
                selected={value === font.family}
                onSelect={() => {
                  loadFont(font.family);
                  onChange(font.family);
                }}
                lazyLoad
              />
            ))}
          </>
        ) : (
          filteredCurated.map((font) => (
            <FontItem
              key={font.value}
              family={font.value}
              selected={value === font.value}
              onSelect={() => onChange(font.value)}
            />
          ))
        )}
      </div>
    </div>
  );
}
