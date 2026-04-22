import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale;
  
  return {
    messages: (await import(`./dictionaries/${validLocale}.json`)).default,
  };
});
