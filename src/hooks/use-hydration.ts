"use client";

import { useEffect, useState } from "react";
import { useTracingStore } from "@/store/tracing-store";

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useTracingStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    useTracingStore.persist.rehydrate();

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
}
