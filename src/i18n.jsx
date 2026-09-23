import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18N, LANGS, detectLang } from "./i18n.js";

const LangContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  useEffect(() => {
    const d = I18N[lang] || I18N.es;
    document.documentElement.setAttribute("lang", lang);
    document.title = d["title"];
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", d["desc"]);
    try { localStorage.setItem("mc-lang", lang); } catch (e) { /* noop */ }
  }, [lang]);

  const value = useMemo(() => {
    const d = I18N[lang] || I18N.es;
    return {
      lang,
      langs: LANGS,
      setLang,
      t: (k) => (d[k] !== undefined ? d[k] : k),
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}
