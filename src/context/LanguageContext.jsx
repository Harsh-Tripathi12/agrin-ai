import { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";

const translations = {
  en,
  hi,
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("agrin_language");
      return saved === "hi" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = useCallback((newLang) => {
    const valid = newLang === "hi" ? "hi" : "en";
    setLanguageState(valid);
    try {
      localStorage.setItem("agrin_language", valid);
    } catch (e) {
      console.warn("Could not save language preference:", e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "hi" : "en");
  }, [language, setLanguage]);

  // Translation helper: t("dashboard", "Dashboard")
  const t = useCallback((key, fallback) => {
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to English dictionary
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback !== undefined ? fallback : key;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi: language === "hi",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}