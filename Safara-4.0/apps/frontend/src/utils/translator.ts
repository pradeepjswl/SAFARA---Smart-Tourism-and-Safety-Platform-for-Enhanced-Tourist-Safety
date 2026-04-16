import { translateText } from "./translate";

const cache: Record<string, string> = {};

export const translateCached = async (text: string, lang: string) => {
  if (!text) return "";
  if (lang === "en") return text;

  const key = `${lang}_${text}`;

  // ✅ return from cache if exists
  if (cache[key]) {
    return cache[key];
  }

  try {
    const translated = await translateText(text, lang);
    cache[key] = translated;
    return translated;
  } catch {
    return text;
  }
};