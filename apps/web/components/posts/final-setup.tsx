"use client";

import { formatPrice, getPreviewPost } from "@/lib/postUtils";
import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import Image from "next/image";
import { ChevronRight, Share2, CalendarDays, Settings } from 'lucide-react';
import { usePathname } from "next/navigation";
import { QRDialog } from "@repo/ui/components/ui/qr-dialog";
import { forwardRef, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { Post, PricingType } from "@prisma/client/edge";
import { Currency, useCurrency } from "@/hooks/useCurrency";
import Link from "next/link";

export function FinalSetup() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });
  const pathname = usePathname();
  const postId = pathname?.split('/')[2];
  const { currency } = useCurrency();

  useEffect(() => {
    // Set initial dimensions
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Update dimensions on window resize
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return;
      const data: Post | any = await getPreviewPost(postId);
      return data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })

  const nextStepCards = [
    {
      icon: Share2,
      title: "Share your listing",
      description: "Get more visibility by sharing with your network",
      onClick: () => {
        /* Add share handling */
      },
    },
    {
      icon: CalendarDays,
      title: "Set your availability",
      description: "Choose which dates your space is available",
      onClick: () => {
        /* Add calendar navigation */
      },
    },
    {
      icon: Settings,
      title: "Adjust your settings",
      description: "Update pricing, house rules, and booking requirements",
      onClick: () => {
        /* Add settings navigation */
      },
    },
  ];

  return (
    <div className="relative flex flex-col justify-center items-center h-full gap-8 p-0 md:px-4 py-24 md:py-32">
      <div className="text-center mb-0 md:mb-8 space-y-1 md:space-y-2">
        <h1 className="text-3xl font-bold text-green-600">Congratulations! 🎉</h1>
        <p className="text-gray-500 text-sm">
          {`You've successfully created your service. Your expertise is now ready to reach clients worldwide.`}
        </p>
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 md:gap-16 mx-auto pb-12 w-full max-w-6xl p-4 md:p-0">
        {showConfetti && (
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}
        {isLoading ? (
          <SkeletonImageCard />
        ) : post ? (
          <ImageCard
            imageUrl={post.coverPhoto}
            title={post.title}
            buttonText="Show preview"
            url={`/find/${post.user.name}/${post.title}/${postId}`}
            currency={currency}
            pricing={post.hourlyRate || post.fixedPrice}
            pricingType={post.pricingType as PricingType}
          />
        ) : (
          <SkeletonImageCard />
        )}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-semibold">{`What's next?`}</h2>
            <p className="text-gray-500 mt-1">{`Follow these steps to enhance your listing's potential`}</p>
          </div>

          <div className="space-y-3">
            {nextStepCards.map(({ icon: Icon, title, description, onClick }, index) => {
              if (!post) return <SkeletonNextStepCard key={title} />;

              return (
                <div key={title}>
                  {index === 0 && (
                    <QRDialog qrValue={`find/${post.user.name}/${post.title}/${postId}`}>
                      <NextStepCard
                        icon={Icon}
                        title={title}
                        description={description}
                        onClick={onClick}
                      />
                    </QRDialog>
                  )}
                  {index !== 0 && (
                    <NextStepCard
                      icon={Icon}
                      title={title}
                      description={description}
                      onClick={onClick}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ImageCardProps {
  imageUrl: string;
  title: string;
  buttonText: string;
  url: string;
  currency: Currency;
  pricing: number;
  pricingType: PricingType;
}

export function ImageCard({
  imageUrl,
  title,
  buttonText,
  url,
  currency,
  pricing = 0,
  pricingType
}: ImageCardProps) {
  return (
    <Card className="w-full sm:max-w-sm overflow-hidden p-4 rounded-3xl shadow-2xl">
      <CardContent className="p-0 relative">
        <div className="relative w-full h-0 pb-[100%] overflow-hidden rounded-xl">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <Link
          href={url}
          className="absolute top-4 left-4 z-10 px-3 py-3 rounded-lg text-xs font-semibold shadow-lg bg-white text-gray-900 hover:bg-gray-100 active:scale-[.98]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {buttonText}
        </Link>
      </CardContent>
      <CardFooter className="px-0 pt-4 pb-0">
        <div className="w-full">
          <div className="flex items-start justify-between">
            <p className="font-semibold capitalize">{title}</p>
            <div className="flex items-center justify-center space-x-1 text-sm">
              <p>New</p>
              <Star className="w-3 h-3 fill-black" />
            </div>
          </div>
          <div>
            <span className="font-semibold">
              {currency === "PHP" ? "₱" : "$"} {formatPrice(pricing)} {" "}
            </span>
            <span>{pricingType === PricingType.HOURLY ? "hour" : "fixed"}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export function SkeletonImageCard() {
  return (
    <Card className="w-full sm:max-w-sm overflow-hidden p-4 rounded-3xl">
      <CardContent className="p-0 relative">
        <div className="relative w-full h-0 pb-[100%] overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        </div>
        <div className="absolute top-4 left-4 z-10 h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />
      </CardContent>
      <CardFooter className="px-0 pt-4 pb-0">
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="flex items-center space-x-1">
              <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-3 bg-gray-200 animate-pulse rounded-full" />
            </div>
          </div>
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}

interface NextStepCardProps {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
}

const NextStepCard = forwardRef<HTMLDivElement, NextStepCardProps>(
  ({ icon: Icon, title, description, onClick }, ref) => {
    return (
      <div
        ref={ref}
        className="group p-4 flex items-center justify-between cursor-pointer rounded-lg transition-colors duration-200 gap-4"
        onClick={onClick}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="text-gray-400 group-hover:text-yellow-500 transform transition-transform group-hover:translate-x-2">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    );
  }
);

NextStepCard.displayName = 'NextStepCard';

function SkeletonNextStepCard() {
  return (
    <div className="p-4 flex items-center justify-between cursor-default bg-gray-100 rounded-lg gap-4 animate-pulse">
      <div className="flex items-center gap-4">
        {/* Icon Placeholder */}
        <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>

        {/* Text Placeholder */}
        <div className="flex flex-col space-y-2">
          <div className="w-44 h-4 bg-gray-300 rounded"></div>
          <div className="w-32 h-3 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Chevron Placeholder */}
      <div className="w-5 h-5 bg-gray-300 rounded"></div>
    </div>
  );
}
