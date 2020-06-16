import i18n from 'i18next';

// import translation catalog
import translationES from '../../../public/locales/es/isotope.json';

const userLanguage = () => navigator.language;

// translation catalog
const resources = {
  es: {
    translation: translationES,
  },
};

// initialize i18next with catalog and language to use
i18n.init({
  resources,
  lng: userLanguage(),
  fallbackLng: ['es'],
});

export default i18n;
