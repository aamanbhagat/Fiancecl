'use client';

import { useCurrency } from '@/contexts/currency-context';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/currency';
import type { Currency } from '@/lib/currency';

/**
 * Hook to use currency formatting in calculator components
 * Provides access to currency data and formatting functions
 */
export function useCalculatorCurrency() {
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
}
