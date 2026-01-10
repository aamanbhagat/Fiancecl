'use client';

import { useCurrency } from '@/contexts/currency-context';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol, CURRENCIES } from '@/lib/currency';
import type { Currency } from '@/lib/currency';

/**
 * Hook to use currency formatting in calculator components
 * Provides access to currency data and formatting functions
 * Safe for SSR - returns USD defaults during server render
 */
export function useCalculatorCurrency() {
  try {
    const { currency, setCurrency, currencyData } = useCurrency();

    const formatCurrency = (amount: number, options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      showSymbol?: boolean;
    }) => formatCurrencyUtil(amount, currency, options);

    const getSymbol = () => getCurrencySymbol(currency);

    return {
      currency,
      setCurrency,
      currencyData,
      formatCurrency,
      getSymbol,
    };
  } catch (error) {
    // If context not available (SSR), return USD defaults
    const defaultCurrency = 'USD';
    const defaultCurrencyData = CURRENCIES.USD;

    const formatCurrency = (amount: number, options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      showSymbol?: boolean;
    }) => formatCurrencyUtil(amount, defaultCurrency, options);

    const getSymbol = () => getCurrencySymbol(defaultCurrency);

    return {
      currency: defaultCurrency,
      setCurrency: () => {},
      currencyData: defaultCurrencyData,
      formatCurrency,
      getSymbol,
    };
  }
}
