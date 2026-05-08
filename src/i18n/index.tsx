import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Language, type Translations } from "./translations";

type LanguageContextValue = {
  lang: Language;
  t: Translations;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "ja") return stored;
    // Prefer English for non-Japanese browsers
    return navigator.language.startsWith("ja") ? "ja" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(getInitialLang);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Language = prev === "en" ? "ja" : "en";
      try {
        localStorage.setItem("lang", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider
      value={{ lang, t: translations[lang] as unknown as Translations, toggle }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
