"use clients";

import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'PHP';

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('preferredCurrency');
      return (savedCurrency === 'USD' || savedCurrency === 'PHP') ? savedCurrency : 'USD';
    }
    return 'USD';
  });

  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency);
  }, [currency]);

  const changeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  return { currency, changeCurrency };
};
