export const locales = ['zh-CN', 'en', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';

export const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  'en': 'English',
  'th': 'ภาษาไทย',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
