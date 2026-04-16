// hooks/useT.ts
// Returns a translation function t(text) that translates on demand.
// Fixed: the old version never populated the map so it always returned original text.
// This version uses translateCached and a simple map updated on language change.
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translateCached } from "../utils/translator";

export const useT = () => {
  const { language } = useLanguage();
  const [, forceUpdate] = useState(0);
  const cache = useRef<Record<string, string>>({});
  const langRef = useRef(language);

  // When language changes, clear the cache so new translations are fetched
  useEffect(() => {
    if (langRef.current !== language) {
      cache.current = {};
      langRef.current = language;
      forceUpdate((n) => n + 1);
    }
  }, [language]);

  // t(text) — returns cached translation or kicks off async fetch
  const t = useCallback(
    (text: string): string => {
      if (!text || language === "en") return text;

      const key = `${language}_${text}`;

      if (cache.current[key]) {
        return cache.current[key];
      }

      // Not cached yet — fetch async and trigger re-render when done
      translateCached(text, language).then((result) => {
        cache.current[key] = result;
        forceUpdate((n) => n + 1);
      });

      // Return original text while async fetch is in flight
      return text;
    },
    [language]
  );

  return t;
};