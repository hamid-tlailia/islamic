import React, { createContext, useState, useContext, useEffect } from "react";
import en from "./langsFiles/en.json"; // Adjust the path as needed
import ar from "./langsFiles/ar.json"; // Adjust the path as needed

// Create a Translation Context
export const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  // Load the saved language from localStorage, or default to "ar"
  const savedLanguage = localStorage.getItem("language") || "ar";
  const [language, setLanguage] = useState(savedLanguage); // Initialize with saved language
  const [translations, setTranslations] = useState(
    savedLanguage === "en" ? en : ar
  ); // Load translations based on saved language

  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang); // Save the selected language in localStorage

    if (lang === "en") {
      setTranslations(en);
      document.body.classList.add("en");
    } else if (lang === "ar") {
      setTranslations(ar);
      document.body.classList.remove("en");
    }
  };

  // Load the saved language from localStorage on initial render
  useEffect(() => {
    changeLanguage(savedLanguage); // Set language and translations based on saved language
    // eslint-disable-next-line
  }, []);

  return (
    <TranslationContext.Provider
      value={{ translations, changeLanguage, language }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translations
export const useTranslation = () => useContext(TranslationContext);
