import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ar } from './locales/ar';
import { en } from './locales/en';
import type { TranslationTree } from './locales/en';
import { getNested, interpolate } from './getNested';
import type { Locale, TranslationParams } from './types';

const STORAGE_KEY = 'gold-hub-locale';

const trees = { en, ar } as const;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
  isRtl: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'ar' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.title = locale === 'ar' ? 'المكتب المركزي لمركز الذهب' : 'Gold Hub Central Desk';
  }, [locale]);

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const tree = trees[locale] as TranslationTree;
      const raw = getNested(tree as Record<string, unknown>, key) ?? getNested(trees.en as Record<string, unknown>, key) ?? key;
      return interpolate(raw, params);
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, isRtl: locale === 'ar' }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
