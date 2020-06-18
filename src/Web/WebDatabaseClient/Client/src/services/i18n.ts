import i18n from "i18next";

// import translation catalog
import translationEN from '../locales/en/isotope.json';
import translationES from '../locales/es/isotope.json';

const userLanguage = () => navigator.language;

// translation catalog
const resources = {
    en: {
            translation: translationEN
        },
    es: {
            translation: translationES
        }
};

// initialize i18next with catalog and language to use
i18n.init({
  resources,
  lng: userLanguage(),
  fallbackLng: ['es', 'en']
});

export default i18n;