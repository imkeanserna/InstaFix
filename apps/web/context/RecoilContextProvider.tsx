"use client";

import React, { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";

export const RecoilContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <RecoilRoot>{children}</RecoilRoot>;
};
