'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CURRENCIES, type Currency } from '@/lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  currencyData: Currency;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const [mounted, setMounted] = useState(false);

  // Load saved currency preference from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('preferred-currency');
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
    } else {
      // Try to detect currency from locale
      const locale = navigator.language;
      const detected = detectCurrencyFromLocale(locale);
      if (detected) {
        setCurrencyState(detected);
      }
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    if (CURRENCIES[newCurrency]) {
      setCurrencyState(newCurrency);
      localStorage.setItem('preferred-currency', newCurrency);
    }
  };

  const currencyData = CURRENCIES[currency] || CURRENCIES.USD;

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencyData }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Helper function to detect currency from locale
function detectCurrencyFromLocale(locale: string): string | null {
  const localeMap: Record<string, string> = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'de': 'EUR',
    'de-DE': 'EUR',
    'fr': 'EUR',
    'fr-FR': 'EUR',
    'es': 'EUR',
    'es-ES': 'EUR',
    'it': 'EUR',
    'it-IT': 'EUR',
    'en-IN': 'INR',
    'hi': 'INR',
    'ja': 'JPY',
    'ja-JP': 'JPY',
    'zh-CN': 'CNY',
    'en-AU': 'AUD',
    'en-CA': 'CAD',
    'en-NZ': 'NZD',
    'en-SG': 'SGD',
    'ko': 'KRW',
    'ko-KR': 'KRW',
    'pt-BR': 'BRL',
    'es-MX': 'MXN',
    'ar-AE': 'AED',
    'ar-SA': 'SAR',
    'th': 'THB',
    'th-TH': 'THB',
  };

  return localeMap[locale] || localeMap[locale.split('-')[0]] || null;
}
