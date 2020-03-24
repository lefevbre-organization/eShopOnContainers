import i18n from "i18next";

// import translation catalog
import translationEN from '../locales/en/isotope.json';
import translationES from '../locales/es/isotope.json';

const userLanguage = () => {
  if (navigator.language.toLowerCase() !== 'en' && navigator.language.toLowerCase() !== 'es' 
      && navigator.language.toLowerCase() !== 'en-en' && navigator.language.toLowerCase() !== 'es-es'){
    return 'es'
  } else {
    return navigator.language;
  }
};

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
  lng: userLanguage()
});

export default i18n;