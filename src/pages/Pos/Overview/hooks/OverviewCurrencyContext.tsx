import React, { createContext, useContext } from 'react';
import type { CurrencyConversion } from '../hooks/useCurrencyConversion';

const OverviewCurrencyContext = createContext<CurrencyConversion | null>(null);

export const OverviewCurrencyProvider: React.FC<{
  value: CurrencyConversion;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <OverviewCurrencyContext.Provider value={value}>
    {children}
  </OverviewCurrencyContext.Provider>
);

export function useOverviewCurrency(): CurrencyConversion {
  const ctx = useContext(OverviewCurrencyContext);
  if (!ctx) {
    throw new Error(
      'useOverviewCurrency must be used within OverviewCurrencyProvider'
    );
  }
  return ctx;
}

/** Safe for optional usage outside provider — returns identity convert */
export function useOverviewCurrencyOptional(): CurrencyConversion | null {
  return useContext(OverviewCurrencyContext);
}
