import { createContext, useContext, useState } from "react";

type LangContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LangContextType | null>(null);

export const LanguageProvider = ({ children }: any) => {
  const [language, setLanguage] = useState("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside provider");
  return context;
};