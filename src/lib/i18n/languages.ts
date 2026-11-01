export const TARGET_LOCALES = [
  'en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'tr', 'ru',
  'ja', 'ko', 'zh', 'ar', 'he', 'hi', 'sv', 'da', 'no', 'cs',
] as const;

export type SupportedLocale = (typeof TARGET_LOCALES)[number];

export interface LanguageInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Record<SupportedLocale, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '简体中文', dir: 'ltr' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' },
  da: { code: 'da', name: 'Danish', nativeName: 'Dansk', dir: 'ltr' },
  no: { code: 'no', name: 'Norwegian', nativeName: 'Norsk', dir: 'ltr' },
  cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', dir: 'ltr' },
};

export const RTL_LANGUAGES = new Set<string>(['ar', 'he', 'fa', 'ur']);

export function isRtl(locale: string): boolean {
  return RTL_LANGUAGES.has(locale.split('-')[0] ?? '');
}

export function formatString(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

