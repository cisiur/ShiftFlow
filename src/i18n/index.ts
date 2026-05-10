import { en } from './en';
import { pl } from './pl';
import { useLanguageStore } from '@/store/languageStore';

export type { Translations } from './en';
export type { AppLanguage } from '@/store/languageStore';

export { en, pl };

/**
 * Returns the translation object for the currently selected language.
 *
 * Usage:
 *   const { t } = useTranslation();
 *   <Text>{t.common.continue}</Text>
 */
export function useTranslation() {
  const language = useLanguageStore(s => s.language);
  const setLanguage = useLanguageStore(s => s.setLanguage);
  const t = language === 'pl' ? pl : en;
  return { t, language, setLanguage };
}
