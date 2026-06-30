import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { ar } from "./ar";
import { en } from "./en";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { ar: { translation: ar }, en: { translation: en } },
      fallbackLng: "en",
      supportedLngs: ["ar", "en"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "lang",
      },
    });
}

export function applyDir(lang: string) {
  if (typeof document === "undefined") return;
  const dir = lang.startsWith("ar") ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang.startsWith("ar") ? "ar" : "en");
}

i18n.on("languageChanged", applyDir);

export default i18n;
