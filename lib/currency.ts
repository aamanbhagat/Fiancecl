/**
 * Currency utilities for multi-currency calculator support
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate relative to USD
  locale: string;
  symbolPosition: 'before' | 'after';
}

export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1,
    locale: 'en-US',
    symbolPosition: 'before',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    exchangeRate: 0.92,
    locale: 'de-DE',
    symbolPosition: 'after',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    exchangeRate: 0.79,
    locale: 'en-GB',
    symbolPosition: 'before',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    exchangeRate: 83.12,
    locale: 'en-IN',
    symbolPosition: 'before',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    exchangeRate: 149.50,
    locale: 'ja-JP',
    symbolPosition: 'before',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    exchangeRate: 7.24,
    locale: 'zh-CN',
    symbolPosition: 'before',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    exchangeRate: 1.52,
    locale: 'en-AU',
    symbolPosition: 'before',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    exchangeRate: 1.35,
    locale: 'en-CA',
    symbolPosition: 'before',
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    exchangeRate: 0.85,
    locale: 'de-CH',
    symbolPosition: 'before',
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    exchangeRate: 10.45,
    locale: 'sv-SE',
    symbolPosition: 'after',
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    exchangeRate: 1.63,
    locale: 'en-NZ',
    symbolPosition: 'before',
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    exchangeRate: 1.34,
    locale: 'en-SG',
    symbolPosition: 'before',
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    exchangeRate: 7.81,
    locale: 'zh-HK',
    symbolPosition: 'before',
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    exchangeRate: 1320.50,
    locale: 'ko-KR',
    symbolPosition: 'before',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    exchangeRate: 4.97,
    locale: 'pt-BR',
    symbolPosition: 'before',
  },
  MXN: {
    code: 'MXN',
    symbol: 'MX$',
    name: 'Mexican Peso',
    exchangeRate: 17.08,
    locale: 'es-MX',
    symbolPosition: 'before',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    exchangeRate: 18.75,
    locale: 'en-ZA',
    symbolPosition: 'before',
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    exchangeRate: 3.67,
    locale: 'ar-AE',
    symbolPosition: 'before',
  },
  SAR: {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    exchangeRate: 3.75,
    locale: 'ar-SA',
    symbolPosition: 'before',
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    exchangeRate: 35.50,
    locale: 'th-TH',
    symbolPosition: 'before',
  },
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const from = CURRENCIES[fromCurrency];
  const to = CURRENCIES[toCurrency];
  
  if (!from || !to) {
    console.warn(`Currency not found: ${fromCurrency} or ${toCurrency}`);
    return amount;
  }
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / from.exchangeRate;
  return usdAmount * to.exchangeRate;
}

/**
 * Format amount in specified currency
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  const formatted = new Intl.NumberFormat(currency.locale, {
    style: options?.showSymbol !== false ? 'currency' : 'decimal',
    currency: currency.code,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(amount);
  
  return formatted;
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  return CURRENCIES[currencyCode]?.symbol || '$';
}

/**
 * Get list of all supported currencies
 */
export function getAllCurrencies(): Currency[] {
  return Object.values(CURRENCIES);
}

/**
 * Get popular currencies for quick selection
 */
export function getPopularCurrencies(): Currency[] {
  return [
    CURRENCIES.USD,
    CURRENCIES.EUR,
    CURRENCIES.GBP,
    CURRENCIES.INR,
    CURRENCIES.JPY,
    CURRENCIES.CAD,
    CURRENCIES.AUD,
  ];
}
