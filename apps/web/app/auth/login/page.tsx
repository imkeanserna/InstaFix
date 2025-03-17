"use client";

import { useMediaQuery } from "@/hooks/useMedia";
import { LoginForm } from "@repo/ui/components/auth/loginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  useEffect(() => {
    if (!isMobile) {
      router.back();
    }
  }, [isMobile, router]);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="h-screen">
      <LoginForm />
    </div>
  );
};

export default Page;
