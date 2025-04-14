import React, { createContext, useContext, useState } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convert: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState('BRL');

  // Taxas de conversão fictícias
  const rates: { [key: string]: number } = {
    BRL: 1,
    USD: 0.2,
    EUR: 0.18,
  };

  const convert = (value: number): string => {
    const convertedValue = value * rates[currency];
    return `${currency} ${convertedValue.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
