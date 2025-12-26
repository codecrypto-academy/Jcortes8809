"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

type Locale = "en" | "es";

type TranslationKeys = typeof en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number | boolean>) => string | string[];
  translations: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Locale, TranslationKeys> = {
  en,
  es,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Cargar idioma guardado al montar
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "es")) {
      setLocaleState(savedLocale);
    } else {
      // Detectar idioma del navegador
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "es") {
        setLocaleState("es");
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  // Función para obtener traducción con soporte para nested keys
  const t = (key: string, params?: Record<string, string | number | boolean>): string | string[] => {
    const keys = key.split(".");
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // Si se solicita retornar objetos (arrays), verificar que sea un array
    if (params?.returnObjects === true) {
      if (Array.isArray(value)) {
        return value;
      } else {
        console.warn(`Translation value is not an array: ${key}`);
        return [];
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Reemplazar parámetros {param}
    if (params) {
      Object.keys(params).forEach((param) => {
        const paramValue = params[param];
        if (typeof paramValue === "string" || typeof paramValue === "number") {
          value = value.replace(new RegExp(`\\{${param}\\}`, "g"), String(paramValue));
        }
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        translations: translations[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
