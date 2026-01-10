'use client';

import { Check, Globe } from 'lucide-react';
import { useCurrency } from '@/contexts/currency-context';
import { getAllCurrencies, getPopularCurrencies } from '@/lib/currency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CurrencySelectorProps {
  variant?: 'select' | 'dropdown';
  className?: string;
}

export function CurrencySelector({ variant = 'select', className = '' }: CurrencySelectorProps) {
  const { currency, setCurrency, currencyData } = useCurrency();
  const popularCurrencies = getPopularCurrencies();
  const allCurrencies = getAllCurrencies();

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Globe className="mr-2 h-4 w-4" />
            {currencyData.symbol} {currencyData.code}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Popular Currencies</DropdownMenuLabel>
          {popularCurrencies.map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className="cursor-pointer"
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  currency === curr.code ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className="flex-1">
                {curr.symbol} {curr.code}
              </span>
              <span className="text-xs text-muted-foreground">{curr.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>All Currencies</DropdownMenuLabel>
          <div className="max-h-60 overflow-y-auto">
            {allCurrencies
              .filter((curr) => !popularCurrencies.some((p) => p.code === curr.code))
              .map((curr) => (
                <DropdownMenuItem
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      currency === curr.code ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <span className="flex-1">
                    {curr.symbol} {curr.code}
                  </span>
                  <span className="text-xs text-muted-foreground">{curr.name}</span>
                </DropdownMenuItem>
              ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Select variant
  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className={className}>
        <SelectValue>
          {currencyData.symbol} {currencyData.code} - {currencyData.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="font-semibold px-2 py-1.5 text-sm text-muted-foreground">
          Popular Currencies
        </div>
        {popularCurrencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            {curr.symbol} {curr.code} - {curr.name}
          </SelectItem>
        ))}
        <div className="border-t my-1" />
        <div className="font-semibold px-2 py-1.5 text-sm text-muted-foreground">
          All Currencies
        </div>
        {allCurrencies
          .filter((curr) => !popularCurrencies.some((p) => p.code === curr.code))
          .map((curr) => (
            <SelectItem key={curr.code} value={curr.code}>
              {curr.symbol} {curr.code} - {curr.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
