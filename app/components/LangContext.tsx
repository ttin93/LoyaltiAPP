"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { T, type Lang } from "@/lib/i18n";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "sl", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sl");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zig:lang");
      if (saved === "sl" || saved === "hr" || saved === "en") setLangState(saved);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("zig:lang", l);
      document.documentElement.lang = l;
    } catch {}
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** Vrne slovar za trenutni jezik. */
export function useT() {
  const { lang } = useLang();
  return T[lang];
}
