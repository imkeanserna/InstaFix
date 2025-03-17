"use client";

import { FC } from "react";
import { GoogleForm } from "./googleForm";
import Image from "next/image";

export const LoginForm: FC = () => {
  return (
    <div className="h-full w-full relative flex flex-col justify-between pt-24 pb-16 
      overflow-clip bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300">
      <div className="relative">
        <Image
          src={"https://pub-e0bfb8aa11494284842ae2b0f72da1ef.r2.dev/screenshot-20250316-073248Z-selected-removebg-preview(1).png"}
          alt={`Message attachment`}
          width={500}
          height={500}
          sizes="100vw"
          className="w-full h-auto object-contain max-h-64 scale-[1.75]"
        />
        <div className="absolute inset-0"></div>
      </div>
      <div className="space-y-32">
        <div className="text-center space-y-14">
          <h2 className="text-4xl font-bold text-gray-800"><span className="text-yellow-500">Fix It</span> Fast and See</h2>
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              Join the Millions Of People Who Have Used
            </p>
            <p>Instafix to Connect With Experts</p>
          </div>
        </div>
        <div className="px-8">
          <GoogleForm
            callbackUrl={"/find"}
            isMobile={true}
          />
        </div>
      </div>
    </div>
  );
};
