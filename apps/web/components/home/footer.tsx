"use client";

import { LOGO } from "@/lib/landingPageUtils";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

export function HomeFooter({ className }: {
  className?: string
}) {
  return (
    <div className={`px-48 py-16 relative ${className} space-y-12 z-20`}>
      <div className="flex items-start justify-between">
        <div className="space-y-4 w-[560px]">
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
            <p>Get more done in less time with AI.</p>
            <p>Crafted by skilled freelancers who know the hustle balancing speed, quality, and efficiency.</p>
          </div>
        </div>
        <div className="max-w-[440px] bg-yellow-400/50 rounded-3xl p-5 space-y-4">
          <p className="text-white font-semibold">The latest Instafix insights delivered to your inbox</p>
          <div className="space-y-2">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Email*"
                maxLength={10}
                className="py-2 px-6 bg-white rounded-full"
              />
              <Button className="rounded-full py-2 px-6 text-gray-900 text-base font-semibold bg-yellow-400 hover:bg-yellow-500">
                Subscribe
              </Button>
            </div>
            <p className="text-[0.6rem] text-white/50">By submitting this form, you consent to Bloomreach processing your data and contacting you to fulfill your request. For more information on how we are committed to protecting and respecting your privacy, please review our Privacy Policy.</p>
          </div>
        </div>
      </div>
      <div className="text-white/70 space-y-6">
        <div className="flex gap-4 items-start">
          <Instagram className="h-5 w-5 cursor-pointer hover:text-white" />
          <div className="p-[0.8px] bg-white/70">
            <Linkedin className="h-4 w-4 fill-gray-900 bg-white/70 text-gray-900 stroke-[0.5] cursor-pointer hover:bg-white" />
          </div>
        </div>
        <p>© 2025 Instafix. All Rights Reserved.</p>
      </div>
    </div >
  );
}
