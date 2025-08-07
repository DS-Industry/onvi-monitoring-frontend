import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enLang from './locales/en/en.json';
import ruLang from './locales/ru/ru.json';

const languageDetector = new LanguageDetector();
languageDetector.init({
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
});

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'ru',
    returnObjects: true,
    resources: {
      en: {
        translation: enLang,
      },
      ru: {
        translation: ruLang,
      },
    },
  });

export default i18n;
