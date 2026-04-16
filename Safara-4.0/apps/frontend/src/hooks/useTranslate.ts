// hooks/useTranslate.ts
// Translates a single string reactively when language changes.
import { useEffect, useState } from "react";
import { translateText } from "../utils/translate";

export const useTranslate = (text: string, language: string): string => {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let mounted = true;

    if (!text || language === "en") {
      setTranslated(text);
      return;
    }

    const run = async () => {
      const result = await translateText(text, language);
      if (mounted) setTranslated(result);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [text, language]);

  // Reset immediately when text changes so we don't flash stale translation
  useEffect(() => {
    setTranslated(text);
  }, [text]);

  return translated;
};