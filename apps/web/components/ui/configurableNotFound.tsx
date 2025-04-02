"use client";

import { useNotFoundContext } from "@/context/NotFoundContext";
import { NOT_FOUND_PAGE } from "@/lib/landingPageUtils";
import Image from "next/image";
import React, { useEffect } from "react";

export function ConfigurableNotFound() {
  const { config } = NOT_FOUND_PAGE;
  const { setIsNotFoundPage } = useNotFoundContext();

  useEffect(() => {
    setIsNotFoundPage(true);
    return () => setIsNotFoundPage(false);
  }, [setIsNotFoundPage]);

  return (
    <div className="flex justify-between px-4 sm:px-8 md:px-12 lg:px-24 min-h-[calc(96vh-4rem)] relative">
      <div className="pt-10 md:pt-16 lg:pt-28 mx-4 sm:mx-8 md:ms-16 lg:ms-36 z-10">
        {config.sections.map((section, index) => {
          if (section.type === "heading") {
            return (
              <div key={index} className="w-full md:w-[500px] lg:w-[700px] leading-normal md:leading-tight lg:leading-[6rem] tracking-wider space-y-3 md:space-y-4 lg:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-semibold md:leading-tight lg:leading-[7rem]">
                  <span className="text-yellow-500">{section.title}</span>{" "}
                  <span>{section.message}</span>
                </h1>
              </div>
            );
          } else if (section.type === "description") {
            return (
              <p key={index} className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-normal md:leading-relaxed lg:leading-[4rem] mt-4">
                {section.text}
              </p>
            );
          } else if (section.type === "links" && section.content) {
            return (
              <p key={index} className="text-gray-500 text-base sm:text-lg md:text-xl lg:text-2xl leading-normal lg:leading-8 mt-6 md:mt-10 lg:mt-16">
                {section.content.map((link, linkIndex) => (
                  <React.Fragment key={linkIndex}>
                    {link.regularText && <span>{link.regularText}</span>}
                    <a href={link.href} className="text-yellow-500 font-semibold">{link.linkText}</a>
                  </React.Fragment>
                ))}
              </p>
            );
          }
          return null;
        })}
      </div>
      <div className="absolute right-0 md:right-10 lg:right-40 bottom-10 md:bottom-0">
        <Image
          src={config.image}
          alt="Freelancer 3D Illustration"
          width={900}
          height={1400}
          quality={100}
          className="h-auto w-80 md:w-96 lg:w-[780px] object-cover"
        />
      </div>
    </div>
  );
}
