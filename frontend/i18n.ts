import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import fr from './locales/fr/translation';
import en from './locales/en/translation';

const resources = {
    fr: { translation: fr },
    en: { translation: en }
};

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
    type: 'languageDetector' as const,
    async: true,
    detect: async (callback: (lng: string) => void) => {
        try {
            const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (storedLanguage) {
                return callback(storedLanguage);
            }

            const locales = Localization.getLocales();
            const phoneLanguage = locales && locales.length > 0 ? locales[0].languageCode : 'fr';
            return callback(phoneLanguage || 'fr');
        } catch (error) {
            console.log('Error reading language', error);
            callback('fr');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    }
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        react: {
            useSuspense: false
        },
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
