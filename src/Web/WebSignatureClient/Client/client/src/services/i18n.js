import i18n from 'i18next';
// import XHR from "i18next-xhr-backend";
import translationES from '../../assets/locales/es/isotope.json';
import translationEsES from '../../assets/locales/es/isotope.json';
import translationEN from '../../assets/locales/en/isotope.json';
import translationFR from '../../assets/locales/fr/isotope.json';

const userLanguage = () => navigator.language;

// translation catalog
const resources = {
  es: {
    translation: translationES,
  },
  esES: {
    translation: translationEsES
  },
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  }
};

// initialize i18next with catalog and language to use
i18n.init({
  resources,
  lng: userLanguage(),
  fallbackLng: ['es', 'es-ES', 'en'],
});

// i18n.use(XHR).init({
//   lng: userLanguage(),
//   fallbackLng: ['es', 'en', 'es-ES'],
//   ns: ["isotope"],
//   defaultNS: "isotope",
//   backend: {
//     loadPath: "../../../../../../../assets/locales/{{lng}}/{{ns}}.json"
//   },
//   interpolation: {
//     escapeValue: false
//   },
//   react: {
//     wait: false,
//     withRef: false,
//     bindI18n: "languageChanged loaded",
//     bindStore: "added removed",
//     nsMode: "default"
//   }
// });

export default i18n;
