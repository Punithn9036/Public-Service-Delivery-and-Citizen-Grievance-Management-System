import React, { createContext, useContext, useState, useEffect } from 'react';
import { FULL_DICTIONARY, MASTER_TRANSLATIONS } from './translationsData';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'National / Official' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North & Central India' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu & Puducherry' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh & Telangana' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala & Lakshadweep' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra & Goa' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat & Daman/Diu' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal & Tripura' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam & North East' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Jammu & Kashmir, Telangana, UP' }
];

export const DICTIONARY = FULL_DICTIONARY;

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('janseva_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('janseva_lang', lang);
  }, [lang]);

  // Universal translation function that checks both structured dictionary keys and phrase texts
  const t = (key, fallback) => {
    if (!key || typeof key !== 'string') return key || '';
    const cleanKey = key.trim();

    // 1. Current language in FULL_DICTIONARY
    if (FULL_DICTIONARY[lang]?.[key]) return FULL_DICTIONARY[lang][key];
    if (FULL_DICTIONARY[lang]?.[cleanKey]) return FULL_DICTIONARY[lang][cleanKey];

    // 2. Current language in MASTER_TRANSLATIONS
    if (MASTER_TRANSLATIONS[lang]?.[key]) return MASTER_TRANSLATIONS[lang][key];
    if (MASTER_TRANSLATIONS[lang]?.[cleanKey]) return MASTER_TRANSLATIONS[lang][cleanKey];

    // 3. Fallback to English in FULL_DICTIONARY
    if (FULL_DICTIONARY['en']?.[key]) return FULL_DICTIONARY['en'][key];
    if (FULL_DICTIONARY['en']?.[cleanKey]) return FULL_DICTIONARY['en'][cleanKey];

    // 4. Fallback to English in MASTER_TRANSLATIONS
    if (MASTER_TRANSLATIONS['en']?.[key]) return MASTER_TRANSLATIONS['en'][key];
    if (MASTER_TRANSLATIONS['en']?.[cleanKey]) return MASTER_TRANSLATIONS['en'][cleanKey];

    return fallback !== undefined ? fallback : key;
  };

  const currentLanguageMeta = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      setLang, 
      t, 
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageMeta 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
