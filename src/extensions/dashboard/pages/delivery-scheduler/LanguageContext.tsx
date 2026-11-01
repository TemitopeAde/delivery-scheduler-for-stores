import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  LANGUAGES,
  TARGET_LOCALES,
  isRtl as checkRtl,
  formatString,
  type SupportedLocale,
  type LanguageInfo,
} from '../../../../lib/i18n/languages';
import {
  getDashboardMessages,
  type DashboardMessageKey,
  type DashboardMessages,
} from '../../../../lib/i18n/dashboard-messages';
import { api } from './dashboard-api';

interface LanguageContextValue {
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale) => Promise<void>;
  t: (key: DashboardMessageKey, values?: Record<string, string | number>) => string;
  isRtl: boolean;
  languages: LanguageInfo[];
  messages: DashboardMessages;
}

const STORAGE_KEY = 'ds_dashboard_locale';

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale;
    if (saved && TARGET_LOCALES.includes(saved)) return saved;
  } catch {
    // Ignore storage errors
  }
  const browserLang = (navigator.language || 'en').split('-')[0]?.toLowerCase() as SupportedLocale;
  if (browserLang && TARGET_LOCALES.includes(browserLang)) return browserLang;
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(detectInitialLocale);

  // Sync with store settings on mount
  useEffect(() => {
    let active = true;
    api.getSettings()
      .then((res: { settings: { translations: { defaultLocale: string } } }) => {
        if (!active) return;
        const storeLocale = res?.settings?.translations?.defaultLocale as SupportedLocale;
        if (storeLocale && TARGET_LOCALES.includes(storeLocale)) {
          setLocaleState(storeLocale);
          try {
            localStorage.setItem(STORAGE_KEY, storeLocale);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Ignore settings load failures here; settings page handles them
      });
    return () => {
      active = false;
    };
  }, []);

  const setLocale = useCallback(async (next: SupportedLocale) => {
    if (!TARGET_LOCALES.includes(next)) return;
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }

    // Notify any listening components
    window.dispatchEvent(new CustomEvent('ds-locale-changed', { detail: next }));

    // Persist to store settings in the background so plugin reflects it
    try {
      const { settings } = await api.getSettings();
      if (settings && settings.translations.defaultLocale !== next) {
        const updated = {
          ...settings,
          translations: {
            ...settings.translations,
            defaultLocale: next,
          },
        };
        const revision = settings.settingsRevision ?? 0;
        await api.saveSettings(revision, updated);
      }
    } catch (error) {
      console.warn('Could not sync defaultLocale to settings', error);
    }
  }, []);

  const messages = useMemo(() => getDashboardMessages(locale), [locale]);

  const t = useCallback(
    (key: DashboardMessageKey, values?: Record<string, string | number>): string => {
      const template = messages[key] ?? key;
      return formatString(template, values);
    },
    [messages],
  );

  const isRtl = useMemo(() => checkRtl(locale), [locale]);

  const languages = useMemo(
    () => TARGET_LOCALES.map((code) => LANGUAGES[code]),
    [],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isRtl,
      languages,
      messages,
    }),
    [locale, setLocale, t, isRtl, languages, messages],
  );

  return (
    <LanguageContext.Provider value={value}>
      <div dir={isRtl ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  );
};

export function useDashboardI18n(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    const fallbackMessages = getDashboardMessages('en');
    return {
      locale: 'en',
      setLocale: async () => {},
      t: (key, values) => formatString(fallbackMessages[key] ?? key, values),
      isRtl: false,
      languages: TARGET_LOCALES.map((code) => LANGUAGES[code]),
      messages: fallbackMessages,
    };
  }
  return context;
}

