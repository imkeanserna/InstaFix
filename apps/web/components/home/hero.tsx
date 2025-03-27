"use client";

import { useTestimonialCarousel, useTextRotator } from "@/hooks/home-page/useHooks";
import {
  FREELANCERS_IMAGE,
  HERO_IMAGE,
  HERO_SECTION_CONFIG,
  HERO_TEXTS,
  OVER_ALL_TESTIMONIAL,
  SECTION_CONFIG,
  TESTIMONIALS,
} from "@/lib/landingPageUtils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Effect3D from "../ui/dramaticCard";
import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import HomeNavbar from "../navbar/HomeNavbar";
import { LoopingBanner } from "../ui/loopingBanner";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: '--font-open-sans'
});

export function HeroSection({
  handleClickButton
}: {
  handleClickButton: () => void;
}) {
  const [selectedSection, setSelectedSection] = useState(SECTION_CONFIG[0].id);
  const currentText = useTextRotator(HERO_SECTION_CONFIG.rotatingTexts, 4000);
  const {
    activeIndex,
    showTestimonials,
    showOverallTestimonial,
    isReturningToSecond,
  } = useTestimonialCarousel();

  const { button, description, staticText } = HERO_SECTION_CONFIG;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <GradientBlobHero />
      <div className="relative z-10">
        <HomeNavbar />
        <LoopingBanner />
        <div className="flex justify-between w-full px-64 items-center py-24">
          <div className="font-cocogoose w-1/2 pe-24 space-y-8">
            <div className="space-y-10">
              <div className="space-y-3 w-full">
                <h1 className="text-7xl font-light leading-[1.2]">{staticText}</h1>
                <div className="flex justify-start">
                  <div className="min-h-[80px] flex items-center">
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={currentText}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="text-7xl font-light leading-[1.2]"
                      >
                        {currentText}
                      </motion.h1>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <p className={`text-xl/8 ${openSans.className} text-gray-600 w-full tracking-wider`}>
                {description}
              </p>
            </div>
            <Button
              onClick={handleClickButton}
              variant={button.variant as "ghost"}
              className={button.className}
            >
              <p className="text-lg transition-all text-white font-light">
                {button.text}
              </p>
            </Button>
          </div>
          <div className="relative rounded-3xl h-[615px] w-[700px] 
          shadow-[0_10px_50px_rgba(255,255,255,0.4)] border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="absolute top-0 right-0 rounded-xl w-[700px] h-[615px]">
              <Image
                src={HERO_IMAGE["car-behind"]}
                alt="Living Room Background"
                width={700}
                height={1200}
                quality={100}
                className="h-full w-full object-cover z-0 rounded-3xl"
              />
            </div>
            <div className="absolute right-2 -bottom-[1px] w-[420px] h-[670px]">
              <Image
                src={FREELANCERS_IMAGE["freelancer-woman"]}
                alt="Be a Instafix Freelancer"
                width={420}
                height={1000}
                quality={100}
                className="h-full w-full object-cover z-0 "
              />
            </div>
            <AnimatePresence mode="wait">
              {showTestimonials && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 50,  // Slides up from below
                    scale: 0.9
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,   // Moves to original position
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 50,  // Slides down
                    scale: 0.9
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                    duration: 0.6
                  }}
                  className="absolute -top-20 -left-28 -space-y-4"
                >
                  {TESTIMONIALS.map((src, idx) => (
                    <motion.div
                      key={src}
                      initial={{
                        scale: idx === activeIndex ? 1.05 : 0.9,
                        opacity: 1
                      }}
                      animate={{
                        scale: idx === activeIndex ? 1.05 : 0.9,
                        opacity: 1
                      }}
                      exit={{
                        opacity: 0,
                        y: 20,
                        scale: 0.9
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                      className={`${idx === activeIndex ? 'z-10' : 'z-0'}`}
                    >
                      <motion.div
                        animate={{
                          scale: (isReturningToSecond && idx === 1)
                            ? [1, 1.1, 1]
                            : 1
                        }}
                        transition={{
                          duration: 0.3,
                          times: [0, 0.5, 1]
                        }}
                      >
                        <div className="relative">
                          <Image
                            src={src}
                            alt={`testimonial hero ${idx + 1}`}
                            width={650}
                            height={200}
                            quality={100}
                            className={`h-24 w-80 object-cover ${idx === activeIndex ? 'rounded-2xl' : 'rounded-none'}`}
                          />
                          <div
                            className="absolute inset-0 bg-yellow-100 mix-blend-multiply opacity-30 
                            pointer-events-none rounded-3xl"
                          ></div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {/*over-all testimonial*/}
            <AnimatePresence>
              {showOverallTestimonial && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 50,  // Slides up from below
                    scale: 0.9
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,   // Moves to original position
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 50,  // Slides down
                    scale: 0.9
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                    duration: 0.6
                  }}
                  className="absolute bottom-32 left-20"
                >
                  <div className="relative">
                    <Image
                      src={OVER_ALL_TESTIMONIAL}
                      alt="testimonial overall"
                      width={650}
                      height={1000}
                      quality={100}
                      className="h-32 w-auto object-cover z-0"
                    />
                    <div
                      className="absolute inset-0 bg-yellow-100 mix-blend-multiply opacity-30 
                        pointer-events-none rounded-3xl"
                    ></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div >
      <div className="flex items-center justify-center mt-48 relative w-full mb-64">
        <GradientBlobSelection />
        <div className={`flex flex-col w-full items-center ${openSans.className} justify-center z-10 gap-12`}>
          <SectionSelector
            sections={SECTION_CONFIG}
            selectedSection={selectedSection}
            onSectionChange={setSelectedSection}
          />
          <Effect3D
            urlImage={
              SECTION_CONFIG.find(s => s.id === selectedSection)?.image || ''
            }
          />
        </div>
      </div>
    </div >
  );
}

const SectionSelector = ({
  sections,
  selectedSection,
  onSectionChange
}: {
  sections: typeof SECTION_CONFIG,
  selectedSection: string,
  onSectionChange: (id: string) => void
}) => (
  <div className="w-auto bg-gray-900/30 rounded-full text-white text-base font-semibold">
    <div className="flex justify-center items-center gap-2 p-2 relative">
      {sections.map((section) => (
        <div key={section.id} className="relative">
          {selectedSection === section.id && (
            <motion.div
              layoutId="button-background"
              className="absolute inset-0 bg-gray-900/70 rounded-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { type: "tween", duration: 0.4, ease: "easeOut" }
              }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
            />
          )}
          <Button
            variant="ghost"
            onClick={() => onSectionChange(section.id)}
            className={`
              inline-block px-3 py-1 rounded-full transition-colors 
              duration-300 relative z-10 hover:bg-gray-900/5 hover:text-white
              ${selectedSection === section.id
                ? 'text-white'
                : 'text-white/70 hover:text-white'
              }
            `}
          >
            <span className="text-lg me-2">{section.emoji}</span>
            {section.text}
          </Button>
        </div>
      ))}
    </div>
  </div>
);

const GradientBlobSelection = () => {
  return (
    <div>
      {/* Bottom Left Gradient Blob */}
      <div
        className="absolute bottom-80 left-1/2 
          -translate-x-1/2 
          w-[1500px] h-[1000px] 
          bg-gradient-to-tr 
          from-yellow-300/10 
          via-yellow-600/50 
          to-black/10 
          rounded-full 
          blur-[140px] 
          -translate-y-1/4 
          animate-[gradientMove_12s_infinite_alternate_reverse]"
      />
      {/* Top Right Gradient Blob */}
      <div
        className="absolute top-0 right-20
            w-[700px] h-[80vh] 
            bg-gradient-to-br 
            from-yellow-300/10 
            via-yellow-600/50 
            to-black/20 
            rounded-full 
            blur-[140px] 
            -translate-x-1/4 
            translate-y-1/4 
            animate-[gradientMove_12s_infinite_alternate]"
      />
      {/* Top Left Gradient Blob */}
      <div
        className="absolute top-0 left-20 
            w-[700px] h-[80vh] 
            bg-gradient-to-br 
            from-yellow-300/10 
            via-yellow-600/50 
            to-black/20 
            rounded-full 
            blur-[140px] 
            -translate-x-1/4 
            translate-y-1/4 
            animate-[gradientMove_12s_infinite_alternate]"
      />
      {/* Bottom Center Gradient Blob */}
      <div
        className="absolute -bottom-44 left-1/2 
            -translate-x-1/2 
            w-[1500px] h-[500px] 
            bg-gradient-to-tr 
            from-yellow-300/10 
            via-yellow-600/50 
            to-black/10 
            rounded-full 
            blur-[140px] 
            -translate-y-1/4 
            animate-[gradientMove_12s_infinite_alternate_reverse]"
      />
    </div>
  );
}

const GradientBlobHero = () => {
  return (
    <div>
      {/* Top Right Gradient Blob */}
      <div
        className="absolute top-0 right-0 
            w-[700px] h-[700px] 
            bg-gradient-to-br 
            from-yellow-300/10 
            via-yellow-600/50 
            to-black/20 
            rounded-full 
            blur-[140px] 
            -translate-x-1/4 
            translate-y-1/4 
            animate-[gradientMove_12s_infinite_alternate]"
      />
      {/* Top Left Gradient Blob */}
      <div
        className="absolute top-0 -left-20
            w-[500px] h-[500px] 
            bg-gradient-to-br 
            from-yellow-300/10 
            via-yellow-600/50 
            to-black/20 
            rounded-full 
            blur-[140px] 
            -translate-x-1/4 
            translate-y-1/4 
            animate-[gradientMove_12s_infinite_alternate]"
      />
      {/* Bottom Center Gradient Blob */}
      <div
        className="absolute bottom-48 left-1/2 
            -translate-x-1/2 
            w-[1000px] h-[1000px] 
            bg-gradient-to-tr 
            from-yellow-300/10 
            via-yellow-600/50 
            to-black/10 
            rounded-full 
            blur-[140px] 
            -translate-y-1/4 
            animate-[gradientMove_12s_infinite_alternate_reverse]"
      />
    </div>
  );
}
