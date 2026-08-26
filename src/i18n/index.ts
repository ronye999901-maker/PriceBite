import { LanguageCode } from '../types';
import { DEFAULT_LANGUAGE } from './languages';
import { translations } from './translations';

export function getTranslation(
  key: string,
  lang: LanguageCode = DEFAULT_LANGUAGE,
  params?: Record<string, string | number>
): string {
  const langDict = translations[lang] || translations[DEFAULT_LANGUAGE];
  let text = langDict[key] || translations[DEFAULT_LANGUAGE][key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });
  }

  return text;
}
