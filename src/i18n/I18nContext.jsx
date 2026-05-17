import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants.js';
import { getTranslation, LANGUAGES } from './translations.js';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.language);
    return LANGUAGES.includes(saved) ? saved : 'en';
  });

  const t = useMemo(() => getTranslation(lang), [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
    document.body.classList.toggle('ui-rtl', t.dir === 'rtl');
  }, [lang, t.dir]);

  const translateTileType = (type) => t.tileTypes[type] || type;

  const value = useMemo(
    () => ({ lang, setLang, t, translateTileType, LANGUAGES }),
    [lang, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
