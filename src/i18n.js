import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "Constants/Languages/english.json";
import translationFR from "Constants/Languages/french.json";
import translationCH from "Constants/Languages/chinese.json";

// the translations
const resources = {
    en: {
        translation: translationEN
    },
    fr: {
        translation: translationFR
    },
    ch: {
        translation: translationCH
    }
};

i18next
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        debug: false,
        lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        fallbackLng: "en", // in case language detector fails
    });

export default i18next;