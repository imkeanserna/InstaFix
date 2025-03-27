"use client";

import { LOGO } from "@/lib/landingPageUtils";
import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeNavbar() {
  const router = useRouter();

  return (
    <div className="sticky px-48 top-0 z-20 flex items-center justify-between py-4">
      <div
        className="flex items-center gap-4 cursor-pointer group"
        onClick={() => {
          router.push("/");
        }}
      >
        <div className={`relative  transition-all duration-300 ${"h-16 w-16"} rounded-[8px] bg-yellow-400`}>
          <div className="absolute inset-0 z-10"></div>
          <Image
            src={LOGO["black-logo"]}
            alt="Instafix Logo"
            layout="fill"
            className="object-cover mix-blend-multiply scale-100 rounded-[8px]"
          />
        </div>
        <h1 className={`transition-all duration-300 font-extrabold ${"text-3xl"}`}>
          <span className="text-gray-900 inline-block transform -skew-x-12">
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
      <div>
      </div>
      <Button
        onClick={() => router.push("/find")}
        variant="ghost"
        className="relative font-cocogoose bg-amber-950 hover:bg-amber-950 
        flex items-center justify-center border-none rounded-full py-7 px-8 active:scale-[0.98]"
      >
        <p className="text-lg transition-all text-white font-light">Get Started</p>
      </Button>
    </div>
  );
}
