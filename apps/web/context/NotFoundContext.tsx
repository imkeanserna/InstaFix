"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotFoundContextType = {
  isNotFoundPage: boolean;
  setIsNotFoundPage: (value: boolean) => void;
};

const NotFoundContext = createContext<NotFoundContextType>({
  isNotFoundPage: false,
  setIsNotFoundPage: () => { },
});

export function NotFoundProvider({ children }: { children: ReactNode }) {
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);

  return (
    <NotFoundContext.Provider value={{ isNotFoundPage, setIsNotFoundPage }}>
      {children}
    </NotFoundContext.Provider>
  );
}

export const useNotFoundContext = () => useContext(NotFoundContext);
