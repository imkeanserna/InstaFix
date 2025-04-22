"use client";

import { FOOTER_SECTION, LOGO } from "@/lib/landingPageUtils";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function HomeFooter({ className, isHome }: {
  className?: string;
  isHome?: boolean;
}) {
  const pathname = usePathname();
  const shouldShowFooter = useMemo(() => {
    const isFind = pathname.includes("/find") || pathname.startsWith("/find/");
    return isFind;
  }, [pathname]);

  const { config } = FOOTER_SECTION;

  if (!shouldShowFooter && !isHome) {
    return null;
  }

  return (
    <div className={`relative ${className} space-y-12 z-20`}>
      <div className="flex flex-col gap-12 md:gap-0 md:flex-row items-start justify-between">
        <div className="space-y-4 w-full md:w-[560px]">
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className={`relative  transition-all duration-300 ${"h-10 w-10"} rounded-[8px] bg-yellow-400`}>
              <div className="absolute inset-0 z-10"></div>
              <Image
                src={LOGO["black-logo"]}
                alt="Instafix Logo"
                layout="fill"
                className="object-cover mix-blend-multiply scale-100 rounded-[8px]"
              />
            </div>
            <h1 className={`transition-all duration-300 font-extrabold ${"text-2xl"}`}>
              <span className="text-white inline-block transform -skew-x-12">
                insta
                <span
                  className={`
                    bg-yellow-400 px-1 rounded-lg text-gray-900 relative 
                    inline-block transform transition-all duration-500
                    skew-x-12 ms-1 group-hover:ms-0 -rotate-12 group-hover:rotate-0 
                    translate-y-0 group-hover:translate-y-0
                `}
                >
                  {/* Nail dot in the top right */}
                  <span className="absolute -top-1 -right-1 h-[6px] w-[6px] bg-gray-500 rounded-full shadow-sm"></span>
                  fix
                </span>
              </span>
            </h1>
          </div>
          <div className="text-white/70 space-y-3">
            <p>{config.sections[0].description}</p>
            <p>{config.sections[0].subdescription}</p>
          </div>
        </div>
        <div className="max-w-[440px] bg-yellow-400/50 rounded-2xl md:rounded-3xl p-5 space-y-4">
          <p className="text-white font-semibold">{config.sections[1].heading}</p>
          <div className="space-y-2">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Email*"
                maxLength={10}
                className="py-2 px-6 bg-white rounded-full"
              />
              <Button className="rounded-full py-2 px-6 text-gray-900 text-base font-semibold bg-yellow-400 hover:bg-yellow-500">
                {config.sections[1].buttonText}
              </Button>
            </div>
            <p className="text-[0.6rem] text-white/50">
              {config.sections[1].subdescription}
            </p>
          </div>
        </div>
      </div>
      <div className="text-white/70 space-y-0 md:space-y-6 flex flex-row md:flex-col justify-between">
        <div className="flex gap-4 items-start">
          <Link href="https://instagram.com/instafix" target="_blank" rel="noopener noreferrer">
            <Instagram className="h-5 w-5 cursor-pointer hover:text-white" />
          </Link>
          <Link href="https://www.linkedin.com/company/instafix-pro" target="_blank" rel="noopener noreferrer">
            <div className="p-[0.8px] bg-white/70">
              <Linkedin className="h-4 w-4 fill-gray-900 bg-white/70 text-gray-900 stroke-[0.5] cursor-pointer hover:bg-white" />
            </div>
          </Link>
        </div>
        <p>© 2025 Instafix. All Rights Reserved.</p>
      </div>
    </div >
  );
}
