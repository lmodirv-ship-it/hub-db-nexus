import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "fr" | "en";

const STORAGE_KEY = "hn-db-lang";
const DEFAULT_LANG: Lang = "ar";

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: "rtl" | "ltr";
}

const Ctx = createContext<LanguageCtx | null>(null);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "ar" || v === "fr" || v === "en" ? v : DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Hydrate from localStorage on mount (avoid SSR mismatch)
  useEffect(() => {
    setLangState(readInitialLang());
  }, []);

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
  };

  return <Ctx.Provider value={{ lang, setLang, dir }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLanguage must be used inside LanguageProvider");
  return c;
}
