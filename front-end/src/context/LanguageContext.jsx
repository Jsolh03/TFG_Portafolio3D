import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { TRANSLATIONS, LANGUAGES } from '../data/i18n';

const DEFAULT_LANG = 'es';
const VALID_IDS = new Set(LANGUAGES.map(l => l.id));

const detectBrowserLang = () => {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;
  const raw = (navigator.language || '').slice(0, 2).toLowerCase();
  return VALID_IDS.has(raw) ? raw : DEFAULT_LANG;
};

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key
});

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.keys(vars).reduce((acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]), str);
}

function resolve(dict, path) {
  const segments = path.split('.');
  let cursor = dict;
  for (const seg of segments) {
    if (cursor && typeof cursor === 'object' && seg in cursor) cursor = cursor[seg];
    else return undefined;
  }
  return cursor;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('lang');
    if (saved && VALID_IDS.has(saved)) return saved;
    return detectBrowserLang();
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang: setLangState,
    t: (key, vars) => {
      const v = resolve(TRANSLATIONS[lang], key);
      if (v !== undefined) return typeof v === 'string' ? interpolate(v, vars) : v;
      const fallback = resolve(TRANSLATIONS[DEFAULT_LANG], key);
      if (fallback !== undefined) return typeof fallback === 'string' ? interpolate(fallback, vars) : fallback;
      return key;
    }
  }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  return useContext(LanguageContext).t;
}
