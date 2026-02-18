"use client";

import { useEffect, useState } from "react";
import { useTracingStore } from "@/store/tracing-store";
import { detectLocale } from "@/lib/i18n";

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useTracingStore.persist.onFinishHydration(() => {
      // If locale was never explicitly saved, detect from browser
      const state = useTracingStore.getState();
      const raw = localStorage.getItem("hermes-tracing");
      const hasPersistedLocale = raw && JSON.parse(raw)?.state?.settings?.locale;
      if (!hasPersistedLocale) {
        state.updateSettings({ locale: detectLocale() });
      }

      setHydrated(true);
    });

    useTracingStore.persist.rehydrate();

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
}
