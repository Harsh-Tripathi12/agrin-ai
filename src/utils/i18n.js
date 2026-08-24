import en from "../locales/en.json";
import hi from "../locales/hi.json";


const translations = {
    en,
    hi,
};


export function getLanguage() {

    return (
        localStorage.getItem(
            "agrin_language"
        ) || "en"
    );
}


export function t(
    key
) {

    const language =
        getLanguage();


    return (
        translations[
            language
        ]?.[key] ||
        translations.en[key] ||
        key
    );
}