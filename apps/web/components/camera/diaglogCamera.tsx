"use client";

import { Button } from "@repo/ui/components/ui/button";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Grid, Instagram, SlidersHorizontal, SwitchCamera, X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Filters } from "../ui/filters";
import { CubeLoader } from "../ui/cubeLoading";
import { Alert } from "@repo/ui/components/ui/alert";
import { MobileControlPanel } from "../mobile/mobileControlPanel";
import { GridCamera } from "../camera/gridCamera";
import { useImageProcessing } from "@/hooks/useImageActions";
import { AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from "next/navigation";
import { EngagementType, PricingType, ServicesIncluded, TargetAudience } from "@prisma/client/edge";
import { getStoredLocation } from "@/lib/sessionUtils";
import { useMediaQuery } from "@/hooks/useMedia";
import { useScrollVisibility } from "@/hooks/useScrollControls";

export const messages = [
  "Choose the right skills for your project.",
  "Check freelancer profiles and reviews.",
  "Start a conversation to ensure a good fit."
];

export function DiaglogCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const settingsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const url = useRef(new URLSearchParams());
  const router = useRouter();
  const searchParams = useSearchParams();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentCamera, setCurrentCamera] = useState<'environment' | 'user'>('environment');
  const { visible } = useScrollVisibility(20, true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    processImage,
    isProcessing,
    videoRef
  } = useImageProcessing({
    onSuccess: ({ detected, professions, subCategories }) => {
      if (subCategories?.length) {
        url.current.set('category', Array.from(new Set(subCategories?.map((item) => item.categoryId))).join(','));
        url.current.set('subcategory', subCategories?.map((item) => item.id).join(','));
      }

      if (professions && professions.length > 0) {
        url.current.set('professions', professions.join(','));
      }

      if (detected) {
        url.current.set('detected', detected);
      }

      handleDialogChange(false);
      setIsOpen(false);
      stopCamera();

      router.push(`/find/camera?${url.current.toString()}`);
    },
    externalErrorSetter: setError,
    onError: async (error) => {
      setError(error);
      setCapturedImage(null);
      await new Promise(r => setTimeout(startCamera, 2000));
    }
  });

  const getInitialState = useCallback(() => {
    return {
      category: null,
      subcategory: null,
      location: searchParams.get('location') ? JSON.parse(searchParams.get('location') as string) : getStoredLocation() || null,
      priceMin: Number(searchParams.get('priceMin')) || null,
      priceMax: Number(searchParams.get('priceMax')) || null,
      pricingType: (searchParams.get('pricingType') as PricingType) || null,
      engagementType: (searchParams.get('engagementType') as EngagementType) || null,
      targetAudience: (searchParams.get('targetAudience') as TargetAudience) || null,
      servicesIncluded: searchParams.get('servicesIncluded') ?
        JSON.parse(searchParams.get('servicesIncluded')!) as ServicesIncluded[] :
        []
    }
  }, [searchParams]);

  const updateUrlParams = useCallback((updates: Partial<ReturnType<typeof getInitialState>>) => {
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        url.current.delete(key);
      } else if (typeof value === 'object') {
        url.current.set(key, JSON.stringify(value));
      } else {
        url.current.set(key, String(value));
      }
    });
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: currentCamera === 'user' ? 'user' : 'environment'
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
      setError(errorMessage);
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setCurrentCamera(prev => prev === 'environment' ? 'user' : 'environment');
    await startCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTimeout(startCamera, 300);
    } else {
      stopCamera();
    }
  };

  const handleFiltersClick = () => {
    setIsFiltersOpen(!isFiltersOpen);
    setIsSettingsOpen(false);
  };

  const handleImageProcessing = async (imageData: Blob | null, source: 'camera' | 'upload') => {
    let processingImage = imageData;

    if (!imageData && videoRef.current && source === 'camera') {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
          }, 'image/jpeg');
        });

        setCapturedImage(URL.createObjectURL(blob));
        processingImage = blob;
      }
    }

    await processImage(processingImage, source);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key === 'e' && isOpen)) {
        setIsOpen(false)
        handleDialogChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      overlayRef.current?.focus()
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && !stream) {
      startCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      const target = event.target as HTMLElement;

      if (target.closest('button[data-filter-toggle]')) {
        return;
      }

      if (event.target.closest('button[data-filter-toggle]')) {
        return;
      }

      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setIsFiltersOpen(false);
      }
    };

    if (isSettingsOpen || isFiltersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen, isFiltersOpen]);

  return (
    <div className="flex flex-col">
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`gap-2 fixed ${(visible && isMobile) ? "bottom-24" : isMobile ? "bottom-8" : "bottom-12"}
             ${isMobile ? "py-1 px-4" : "py-6 px-5"} text-xs left-1/2 -translate-x-1/2 z-0
             rounded-full shadow-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400
             hover:scale-105 transition-all duration-200 hover:text-gray-900 active:scale-[0.97]
             border-2 border-amber-300`}
        aria-expanded={isOpen}
        aria-controls="slide-overlay"
      >
        {isMobile ? "Snap" : "Show snap"}
        <Instagram className="h-5 w-5 fill-white stroke-gray-900" />
      </Button>

      <div
        id="slide-overlay"
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
      >
        {/* Main Camera View */}
        {isProcessing && (
          <div className="absolute inset-0 pointer-events-none z-50">
            <CubeLoader messages={messages} />
          </div>
        )}

        <div className="relative h-full flex justify-center items-center bg-black">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 bg-transparent hover:bg-transparent rounded-full hover:text-gray-200 absolute top-2 md:top-4 right-2 md:right-4 z-50"
            onClick={() => {
              handleDialogChange(false);
              setIsOpen(false)
            }}
          >
            <X className="h-4 w-4 rounded-full" />
          </Button>

          {/*Switch Camera*/}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-36 md:bottom-10 right-2 md:right-6 z-50 border border-white rounded-full hover:bg-white/10 p-2 w-12 h-12"
            onClick={switchCamera}
          >
            <SwitchCamera className="h-5 w-5 text-white" />
          </Button>

          {/* Left Side */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 left-2 z-50 md:hidden",
              "hover:bg-white/10",
            )}
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className={cn("h-4 w-4", showGrid ? "text-blue-400" : "text-gray-400")} />
          </Button>

          {error && (
            <Alert
              type="warning"
              title="Camera Error"
              body={error}
              className="md:bottom-10 right-0 z-30 max-w-[90vw] md:max-w-md bottom-24"
            />
          )}

          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="w-full h-full">
              <div className="flex justify-center items-center w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              {showGrid &&
                <GridCamera
                  handleImageProcessing={handleImageProcessing}
                  setError={setError}
                />
              }
            </div>
          )}

          {/* Camera Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent border-b-2 md:border-b-4 border-yellow-600">
            <div className="max-w-xl mx-auto p-4 md:p-8">
              <AnimatePresence>
                {isFiltersOpen && (
                  <Filters
                    initialState={getInitialState()}
                    onFilterChange={updateUrlParams}
                    onClose={handleFiltersClick}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Camera Controls */}
            <div className="items-center justify-center gap-2 md:gap-4 p-2 md:p-4 hidden md:flex">
              {/* Left Side */}
              <Button
                variant="outline"
                size="icon"
                data-filter-toggle
                className={cn(
                  "rounded-full bg-black/50 backdrop-blur-sm border-2 transition-all duration-200",
                  showGrid
                    ? "bg-yellow-500 border-yellow-400 text-white hover:bg-yellow-400"
                    : "bg-black/50 border-white/20 text-white hover:border-yellow-400/50"
                )}
                onClick={() => setShowGrid(!showGrid)}
              >

                <Grid className={cn("h-4 md:h-5 w-4 md:w-5",)} />
              </Button>

              {/* Center - Snap Button */}
              <div className="flex flex-col items-center">
                <Button
                  onClick={() => { handleImageProcessing(null, 'camera') }}
                  size="lg"
                  disabled={isProcessing}
                  className="rounded-full w-16 h-16 md:w-20 md:h-20 p-0 bg-yellow-500 hover:bg-yellow-400 shadow-lg border-4 border-yellow-400/20 transition-all duration-200 hover:scale-105"
                >
                  <Camera className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </Button>
                <span className="text-yellow-400 text-xs md:text-sm mt-1 md:mt-2 font-medium drop-shadow-lg">
                  Snap it!
                </span>
              </div>

              {/* Filters Button */}
              <Button
                variant="outline"
                size="icon"
                data-filter-toggle
                className={cn(
                  "rounded-full bg-black/50 backdrop-blur-sm border-2 transition-all duration-200",
                  isFiltersOpen
                    ? "bg-yellow-500 border-yellow-400 text-white hover:bg-yellow-400"
                    : "bg-black/50 border-white/20 text-white hover:border-yellow-400/50"
                )}
                onClick={handleFiltersClick}
              >
                <SlidersHorizontal className="h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </div>

            <MobileControlPanel
              handleImageProcessing={handleImageProcessing}
              handleFiltersClick={handleFiltersClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
