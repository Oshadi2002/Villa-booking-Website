'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, TRANSLATIONS } from './translations';

interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  isSi: boolean;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  isSi: false,
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>('en');

  // Load saved language on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lankagama_site_lang');
      if (saved === 'en' || saved === 'si') {
        setLangState(saved);
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lankagama_site_lang' && (e.newValue === 'en' || e.newValue === 'si')) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLang = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem('lankagama_site_lang', newLang);
      window.dispatchEvent(new Event('lankagama_lang_changed'));
    } catch {}
  };

  const isSi = lang === 'si';

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[lang];
    if (dict && dict[key]) {
      return dict[key];
    }
    const enDict = TRANSLATIONS.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isSi, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * The exact compact toggle pill component matching the user's design:
 * Dark border pill with [ EN | සිංහල ], active state gets gold background and dark text.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center rounded-full bg-[#14231B] p-0.5 border border-[#3B5244] shadow-inner select-none transition-all ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
          lang === 'en'
            ? 'bg-[#D4AF37] text-[#14231B] shadow-xs'
            : 'text-[#C2BCB0] hover:text-[#F5F2EB]'
        }`}
        title="Switch language to English"
        aria-pressed={lang === 'en'}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang('si')}
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
          lang === 'si'
            ? 'bg-[#D4AF37] text-[#14231B] shadow-xs'
            : 'text-[#C2BCB0] hover:text-[#F5F2EB]'
        }`}
        title="භාෂාව සිංහලට මාරු කරන්න"
        aria-pressed={lang === 'si'}
      >
        සිංහල
      </button>
    </div>
  );
}
