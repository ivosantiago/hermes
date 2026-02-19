"use client";

import { useCallback } from "react";
import { useTracingStore } from "@/store/tracing-store";
import { t as translate, type TranslationKey } from "@/lib/i18n";

export function useTranslation() {
  const locale = useTracingStore((s) => s.settings.locale);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  return { t, locale } as const;
}
