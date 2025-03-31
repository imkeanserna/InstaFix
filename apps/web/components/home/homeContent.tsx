"use client";

import { Open_Sans } from "next/font/google";
import { HeroSection } from "./hero";
import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import {
  AI_MESSAGES,
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
  return (
    <div className={`h-full w-full relative mt-32 md:mt-60 mb-0 gap-4 md:gap-8 lg:gap-36 grid grid-cols-1 
          md:grid-cols-2 px-4 md:px-12 lg:px-48 ${openSans.className}`}
    >
      <div className="flex flex-col space-y-8 mb-4 md:mb-16">
        <h1 className="text-center md:text-start text-[2.2rem] md:text-5xl font-bold leading-[1.3]">
          {MOBILE_SECTION.title.main}{" "}
          <span className="italic">
            {MOBILE_SECTION.title.highlighted}
          </span>
        </h1>
        <p className="text-sm md:text-base lg:text-lg leading-[1.8] md:leading-8 w-full lg:w-3/4 text-gray-700 text-center md:text-start">
          {MOBILE_SECTION.description}
        </p>
        <div className="flex flex-col space-y-6 md:space-y-4">
          {MOBILE_SECTION.features.map((feature, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-start">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 
                to-amber-500 flex items-center justify-center"
              >
                <Check className="text-white w-6 h-6 opacity-70" strokeWidth={5} />
              </div>
              <div className="w-full space-y-3">
                <p className="text-lg font-bold">{feature.title}</p>
                <p className="text-sm md:text-base lg:text-lg leading-[1.8] text-gray-800">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center md:justify-start">
        <Image
          src={MOBILE_SECTION.mobileImage}
          alt="Living Room Background"
          width={700}
          height={1200}
          quality={100}
          className={`h-auto w-48 md:w-96 object-cover block md:absolute md:-top-40 -rotate-12`}
        />
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
        <div
          className="font-bold block md:hidden text-center text-white text-[1.9rem] leading-[1.3]"
          dangerouslySetInnerHTML={{ __html: HEADING_AI_SECTION.mobileHeading }}
        />
        <div className="">
          <div className="max-w-4xl mx-auto rounded-xl p-0 md:p-6 space-y-6">
            <div className="space-y-6">
              {AI_MESSAGES.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-1 space-x-2 ${message.sender === 'AI' ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {message.sender === 'AI' ? (
                    <div className="ps-1 relative">
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
                    </div>
                  ) : (
                    <div className="ps-1 relative">
                      <div className="relative w-6 h-6 rounded-full flex items-center justify-center ring-1 ring-gray-500/50">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`px-6 py-4 text-white max-w-full leading-8 tracking-wide border border-gray-200/10 
                      ${message.sender === "AI"
                        ? `rounded-tl-3xl rounded-br-3xl rounded-tr-3xl bg-gray-800`
                        : `rounded-tr-3xl md:rounded-tr-full rounded-tl-3xl md:rounded-tl-full 
                        rounded-bl-3xl md:rounded-bl-full bg-gray-950/50 text-right`
                      }`
                    }>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <InstafixRequestCard
              imageUrl={FREELANCERS_IMAGE["bathroom"]}
              title="Broken Bathroom Sink Repair"
              category="Home Repair"
              userAvatar={FREELANCERS_IMAGE["freelancer-man"]}
              userName="Michael Johnson"
              joinedDate="3 months ago"
              isThinking={true}
            />
          </div>
        </div>
      </div>
      <div className={`mt-48 mb-6 md:mb-12 w-full ${openSans.className}`}>
        <ScrollingText />
      </div>
      <HomeFooter
        className={"px-4 md:px-12 lg:px-48 py-10 md:py-16"}
        isHome={true}
      />
    </div>
  );
}
