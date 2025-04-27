"use client";

import { Open_Sans } from "next/font/google";
import { HeroSection } from "./hero";
import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import {
  AI_MESSAGES,
  CALLTOACTION,
  DISCOVER_SECTION,
  FREELANCERS_IMAGE,
  HEADING_AI_SECTION,
  MOBILE_SECTION
} from "@/lib/landingPageUtils";
import { Check, Diamond, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage } from "@repo/ui/components/ui/avatar";
import { DotTypingLoading } from "@repo/ui/components/ui/dot-typing-loading";
import { ScrollingText } from "../ui/scrollingText";
import { HomeFooter } from "./footer";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMedia";
import { motion, useInView } from "framer-motion";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: '--font-open-sans'
});

export default function HomeContent() {
  const router = useRouter();

  const handleClickButton = () => {
    router.push("/find");
  }

  return (
    <div>
      <HeroSection handleClickButton={handleClickButton} />
      <DiscoverComponent handleClickButton={handleClickButton} />
      <InstafixHeroCTA handleClickButton={handleClickButton} />
      <ShowMobileContent />
      <IntroductionAI />
    </div >
  );
}

export function DiscoverComponent({
  handleClickButton
}: {
  handleClickButton: () => void;
}) {
  const [isHoveredFirst, setIsHoveredFirst] = useState(false);
  const [isHoveredSecond, setIsHoveredSecond] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobile) {
      setIsHoveredFirst(true);
      setIsHoveredSecond(true);
    }
  }, [isMobile]);

  const { config } = DISCOVER_SECTION;

  return (
    <div className="h-full w-full mt-0 mb-10 md:mb-20 flex flex-col items-center 
        font-cocogoose px-4 md:px-12 lg:px-48 space-y-16 md:space-y-24 lg:space-y-28"
    >
      <h1 className={'w-full lg:w-[52%] text-center text-[2.0rem] md:text-[3.5rem] font-light leading-[1.3]'}>
        Discover your{" "}
        <span className="italic">personalized benefits 🙌</span>
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-5">
        {config.sections.map((section, index) => (
          <div
            key={section.type}
            onClick={handleClickButton}
            className={`group flex relative h-[640px] md:h-[450px] bg-gray-950/50 justify-between 
              rounded-3xl p-8 overflow-hidden transition-all duration-500 ease-in-out 
              hover:ring-4  hover:ring-offset-4 hover:ring-offset-transparent 
              ${section.accentColor === 'orange' ? 'hover:ring-orange-400/50' : 'hover:ring-yellow-400/50'}
              hover:-translate-y-4 transform hover:shadow-2xl cursor-pointer
            `}
            onMouseEnter={() => index === 0 ? setIsHoveredFirst(true) : setIsHoveredSecond(true)}
            onMouseLeave={() => index === 0 ? setIsHoveredFirst(false) : setIsHoveredSecond(false)}
          >
            {/*Rings*/}
            <div
              className={`
                absolute bottom-[-200px] -right-16 w-[500px] h-[500px] bg-transparent border-[60px] 
                ${section.accentColor === 'orange' ? 'border-orange-400' : 'border-yellow-400'}
                rounded-full transition-all duration-500 ease-in-out
                ${index === 0
                  ? (isHoveredFirst
                    ? 'opacity-100 scale-100 transform translate-x-0 translate-y-0'
                    : 'opacity-0 scale-[0.25] transform translate-x-[-50px] translate-y-[50px]')
                  : (isHoveredSecond
                    ? 'opacity-100 scale-100 transform translate-x-0 translate-y-0'
                    : 'opacity-0 scale-[0.25] transform translate-x-[-50px] translate-y-[50px]')
                }
              `}
            ></div>
            {/* Soft light effect in top left */}
            <div className={`
              rounded-full blur-3xl absolute top-0 left-0 size-[320px] 
              -translate-x-2/3 -translate-y-2/3 md:-translate-x-1/2 md:-translate-y-1/2 
              ${section.accentColor === 'orange'
                ? 'bg-orange-400/50'
                : 'bg-yellow-400/50'
              }`}
            ></div>
            {/* Soft light effect */}
            <div className={`
              rounded-full blur-3xl absolute bottom-0 right-0 size-[500px] 
              translate-x-2/3 translate-y-2/3 md:translate-x-1/2 md:translate-y-1/2 
              ${section.accentColor === 'orange'
                ? 'bg-orange-400'
                : 'bg-yellow-400'
              }`}
            ></div>

            <div className="space-y-4 md:space-y-12 w-full md:w-[60%] relative z-10">
              <Button
                className="bg-white text-sm md:text-[0.92rem] group hover:bg-white text-yellow-600 
                px-6 md:px-10 py-4 md:py-6 rounded-full font-light flex items-center gap-3 active:scale-[0.98]"
                onClick={handleClickButton}
              >
                <Diamond size={16} className="fill-yellow-600 text-yellow-600" />
                {section.buttonText}
              </Button>
              <div className="space-y-3 text-white">
                <p className="text-3xl/10 font-light md:leading-[1.5] tracking-normal md:tracking-wide">
                  {section.description}
                </p>
                {section.subDescription && (
                  <p className={`text-sm md:text-lg ${openSans.className}`}>
                    {section.subDescription}
                  </p>
                )}
              </div>
            </div>

            <Image
              src={section.image}
              alt="Living Room Background"
              width={700}
              height={1200}
              quality={100}
              className={`h-auto w-72 object-cover absolute 
                ${section.type === "Freelancers" ? "bottom-0" : "-bottom-8"} 
                right-0 z-0 rounded-3xl`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShowMobileContent() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const isContentInView = useInView(contentRef, { once: true, amount: 0.2 });

  return (
    <div
      ref={sectionRef}
      className={`h-full w-full relative mt-32 md:mt-[200px] lg:mt-[650px] mb-0 md:mb-10 flex items-center justify-center px-4 md:px-12 lg:px-48 ${openSans.className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-0 max-w-6xl mx-auto relative">
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 50 }}
          animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.7, staggerChildren: 0.2 }}
          className="flex flex-col space-y-8 mb-4 md:mb-16 items-center md:items-start"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center md:text-start text-[2.2rem] md:text-5xl font-bold leading-[1.3] whitespace-normal md:whitespace-nowrap"
          >
            {MOBILE_SECTION.title.main}{" "}
            <span className="italic">
              {MOBILE_SECTION.title.highlighted}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm md:text-base lg:text-lg leading-[1.8] md:leading-8 w-full lg:w-3/4 text-gray-700 text-center md:text-start"
          >
            {MOBILE_SECTION.description}
          </motion.p>
          <div className="flex flex-col space-y-6 md:space-y-4 w-full">
            {MOBILE_SECTION.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-start"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 
                    to-amber-500 flex items-center justify-center"
                >
                  <Check className="text-white w-6 h-6 opacity-70" strokeWidth={5} />
                </motion.div>
                <div className="w-full space-y-3">
                  <p className="text-lg font-bold">{feature.title}</p>
                  <p className="text-sm md:text-base lg:text-lg leading-[1.8] text-gray-800">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="w-full flex justify-center items-center">
          <Image
            src={MOBILE_SECTION.mobileImage}
            alt="Living Room Background"
            width={700}
            height={1200}
            quality={100}
            className={`h-auto w-48 md:w-72 lg:w-96 object-cover block md:absolute md:top-10 lg:-top-44 lg:-right-16 -rotate-12`}
          />
        </div>
      </div>
    </div>
  );
}

interface InstafixRequestCardProps {
  imageUrl: string;
  title: string;
  category: string;
  userAvatar: string;
  userName: string;
  joinedDate: string;
  isThinking?: boolean;
}

const InstafixRequestCard = ({
  imageUrl,
  title,
  category,
  userAvatar,
  userName,
  joinedDate,
  isThinking = false
}: InstafixRequestCardProps) => {
  return (
    <div className="ps-12 md:px-12 space-y-4">
      <div
        className="max-w-sm md:w-auto overflow-hidden backdrop-blur border-l-4 border-l-yellow-500 
          bg-gray-800 rounded-r-2xl border-y border-y-white/20 border-e border-e-white/20"
      >
        <div className="rounded-2xl flex gap-4 px-3 py-2 relative">
          <Image
            src={imageUrl}
            alt={`Message attachment for ${title}`}
            width={150}
            height={150}
            className="rounded-2xl h-24 w-24 object-cover"
          />
          <div className="text-white">
            <p className="font-bold">{title}</p>
            <p className="text-xs">{category}</p>
            <div className="flex items-start gap-2 mt-2">
              <Avatar className={`h-10 w-10 border-transparent border border-gray-500 transition-all bg-yellow-400/50`}>
                <AvatarImage
                  src={userAvatar}
                  alt={"User Profile"}
                  className="object-cover"
                />
              </Avatar>
              <div>
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs font-medium">Joined {joinedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isThinking && (
        <div className="flex items-center justify-start gap-2">
          <p className="text-sm italic text-yellow-400/70 animate-pulse">
            InstaFix Assistant is thinking
          </p>
          <DotTypingLoading color={"bg-yellow-500"} />
        </div>
      )}
    </div>
  );
};

export function IntroductionAI() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const chatSectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chatSectionRef, {
    once: true,
    amount: 0.2
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const requestCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: AI_MESSAGES.length * 0.3 + 0.2
      }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    containerRef.current?.addEventListener('mousemove', handleMouseMove);
    return () => containerRef.current?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`w-full bg-gradient-to-b relative from-gray-950 overflow-hidden to-gray-900 ${openSans.className} pt-32`}
      ref={containerRef}
    >
      {/* Gradient Cursor Circle */}
      <div
        className="blob-ai-section"
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`
        }}
      />
      {/* Gradient Circles */}
      <div className="absolute -top-[200px] md:-top-[600px] inset-x-0 
        mx-auto w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-gradient-to-tr 
        from-[#1100ff] md:from-[#1100ff]/60 via-[#5500aa] md:via-[#5500aa]/60 to-[#ff00f2]/20 md:to-[#ff00f2]/20
        rounded-full blur-[140px] animate-[gradientMove_12s_infinite_alternate] z-10"
      />
      <div
        className="absolute bottom-[28rem] -left-48
          w-[500px] h-[500px] bg-gradient-to-br 
          from-[#1100ff] via-[#5500aa] to-[#ff00f2] rounded-full 
          blur-[140px] -translate-x-1/4 translate-y-1/4 
          animate-[gradientMove_12s_infinite_alternate] z-10"
      />
      <div className="space-y-16 relative z-20 px-4 md:px-12 lg:px-0">
        <div className="space-y-6 hidden md:block">
          <h1 className="font-bold text-center text-white text-5xl tracking-wide">
            {HEADING_AI_SECTION.heading}
          </h1>
          <h1 className="text-center text-white text-3xl tracking-wide flex gap-2 justify-center">
            {HEADING_AI_SECTION.subheading.split('personal AI assistant 🤖,').map((part, index) =>
              index === 0 ? (
                <div key={index}>{part}</div>
              ) : (
                <div key={index}>
                  <span className="italic text-yellow-400 text-4xl font-cocogoose font-light">personal AI assistant
                    <span className="not-italic">{" "} 🤖,</span>
                  </span>
                  {part}
                </div>
              )
            )}
          </h1>
        </div>
        <motion.div
          className="font-bold block md:hidden text-center text-white text-[1.9rem] leading-[1.3]"
          dangerouslySetInnerHTML={{ __html: HEADING_AI_SECTION.mobileHeading }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headingVariants}
        />

        <div ref={chatSectionRef}>
          <motion.div
            className="max-w-4xl mx-auto rounded-xl p-0 md:p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div className="space-y-6" variants={containerVariants}>
              {AI_MESSAGES.map((message, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  className={`flex items-end gap-1 space-x-2 ${message.sender === 'AI' ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {message.sender === 'AI' ? (
                    <motion.div
                      className="ps-1 relative"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.3 + 0.2 }}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 
                      rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"
                      />
                      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 
                        via-yellow-600 to-yellow-700 flex items-center justify-center ring-1 ring-violet-500/50 shadow-sm"
                      >
                        <div className="text-sm font-medium text-white/90 select-none">
                          AI
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="ps-1 relative"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.3 + 0.2 }}
                    >
                      <div className="relative w-6 h-6 rounded-full flex items-center justify-center ring-1 ring-gray-500/50">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: message.sender === "AI" ? -20 : 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: message.sender === "AI" ? -20 : 20 }}
                    transition={{ duration: 0.5, delay: index * 0.3 }}
                    className={`px-6 py-4 text-white max-w-full leading-8 tracking-wide border border-gray-200/10 
                      ${message.sender === "AI"
                        ? `rounded-tl-3xl rounded-br-3xl rounded-tr-3xl bg-gray-800`
                        : `rounded-tr-3xl md:rounded-tr-full rounded-tl-3xl md:rounded-tl-full 
                          rounded-bl-3xl md:rounded-bl-full bg-gray-950/50 text-right`
                      }`
                    }
                  >
                    <p>{message.text}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              variants={requestCardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <InstafixRequestCard
                imageUrl={FREELANCERS_IMAGE["bathroom"]}
                title="Broken Bathroom Sink Repair"
                category="Home Repair"
                userAvatar={FREELANCERS_IMAGE["freelancer-man"]}
                userName="Michael Johnson"
                joinedDate="3 months ago"
                isThinking={true}
              />
            </motion.div>
          </motion.div>
        </div>
        <div className={`mt-48 mb-6 md:mb-12 w-full ${openSans.className}`}>
          <ScrollingText />
        </div>
        <HomeFooter
          className={"px-4 md:px-12 lg:px-48 py-10 md:py-16"}
          isHome={true}
        />
      </div>
    </div>
  );
}

export function InstafixHeroCTA({
  handleClickButton
}: {
  handleClickButton: () => void;
}) {
  const { config } = CALLTOACTION;
  const titleParts = config.title.split('Instafix');
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.3 }
    }
  };

  return (
    <div className="w-full px-4 md:px-12 lg:px-48" ref={containerRef}>
      <motion.div
        className="h-[600px] rounded-3xl relative bg-yellow-500"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="absolute top-28 inset-0 flex lg:items-start justify-center text-center lg:text-start">
          <div className="flex gap-32 justify-between">
            <motion.div
              className="w-[400px] relative hidden lg:block"
              variants={imageVariants}
            >
              {/* Circle glow effect behind the image */}
              <div className="absolute -left-16 top-20 inset-0 h-[500px] w-[500px] rounded-full bg-yellow-700 blur-2xl opacity-50 z-10 transform scale-110"></div>
              {/* Image container with position relative to contain the overlay */}
              <div className="relative z-20">
                {/* Skeleton loading overlay */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-yellow-800 to-gray-900 rounded-[30px] z-20 overflow-hidden animate-pulse">
                  </div>
                )}
                {/* Main image with right-click protection */}
                <div onContextMenu={(e) => e.preventDefault()}>
                  <Image
                    src={config.callToImage}
                    alt="Living Room Background"
                    width={700}
                    height={1200}
                    quality={100}
                    className={`h-auto w-full object-cover rounded-[30px] shadow-2xl border-8 border-gray-950
                    ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onLoad={() => setImageLoaded(true)}
                    unoptimized={true}
                    priority
                  />
                </div>
              </div>
            </motion.div>
            <div className="max-w-xl space-y-11 p-16 md:p-0">
              <motion.h1
                className="text-3xl md:text-6xl font-bold text-gray-950 flex gap-4 justify-center md:justify-start"
                variants={childVariants}
              >
                {titleParts[0]}
                <span className="text-white inline-block transform -skew-x-12">
                  Insta
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
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl md:leading-9 text-gray-950"
                variants={childVariants}
              >
                {config.description}
              </motion.p>

              <motion.div variants={childVariants}>
                <Button
                  onClick={handleClickButton}
                  className="py-8 px-12 text-lg font-bold rounded-full bg-yellow-600 hover:bg-gray-50 border-2 border-yellow-600 text-white hover:text-yellow-600 active:scale-[0.99]"
                >
                  {config.buttonText}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
