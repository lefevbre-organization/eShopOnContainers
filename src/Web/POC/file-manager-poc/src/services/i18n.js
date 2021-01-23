import i18n from 'i18next';
import translationES from '../assets/locales/es/isotope.json';

const userLanguage = () => navigator.language;

const resources = {
	es: {
		translation: translationES,
	}
};

i18n.init({
	resources,
	lng: userLanguage(),
	fallbackLng: ['es'],
});

export default i18n;
