"use client";

import { Button } from "@repo/ui/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { ComboboxLocation } from "../ui/locationComboxBox";
import { Camera, Grid, ImagePlus, MapPin, MapPinPlus, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Filters } from "../ui/filters";
import { CubeLoader } from "../ui/cubeLoading";
import { Alert } from "@repo/ui/components/ui/alert";
import { MobileControlPanel } from "../mobile/mobileControlPanel";
import { GridCamera } from "../camera/gridCamera";
import { useImageProcessing } from "@/hooks/useImageActions";

const messages = [
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
  const {
    processImage,
    isLoading,
    videoRef
  } = useImageProcessing({
    onSuccess: () => handleDialogChange(false),
    externalErrorSetter: setError
  });

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
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

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsFiltersOpen(false);
  };

  const handleImageProcessing = async (imageData: Blob | null, source: 'camera' | 'upload') => {
    await processImage(imageData, source);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
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
    <div className="min-h-screen flex flex-col">
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        aria-expanded={isOpen}
        aria-controls="slide-overlay"
      >
        <ImagePlus className="h-4 w-4" />
        Snap a Fix
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
        {isLoading && (
          <div className="absolute inset-0 pointer-events-none z-30">
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

          {/* Left Side */}
          <Button
            variant="outline"
            size="icon"
            data-filter-toggle
            className={cn(
              "rounded-full bg-black/50 backdrop-blur-sm border-2 transition-all duration-200",
              "absolute top-4 left-4 z-50 block md:hidden", // Absolute positioning for mobile view
              "flex items-center justify-center",
              isSettingsOpen
                ? "bg-yellow-500 border-yellow-400 text-white hover:bg-yellow-400"
                : "bg-black/50 border-white/20 text-white hover:border-yellow-400/50"
            )}
            onClick={handleSettingsClick}
          >
            {isSettingsOpen ? (
              <MapPinPlus className="h-5 w-5" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
          </Button>

          {error && (
            <Alert
              type="warning"
              title="Camera Error"
              body={error}
              className="md:bottom-10 right-0 z-30 max-w-[90vw] md:max-w-md bottom-24"
            />
          )}

          <div className="w-full h-full">
            <div className="flex justify-center items-center w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover" // Use object-cover to fill the screen
              />
            </div>
            {showGrid && <GridCamera
              handleImageProcessing={handleImageProcessing}
              setError={setError}
            />}
          </div>

          {/* Camera Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent border-b-2 md:border-b-4 border-yellow-600">
            <div className="max-w-xl mx-auto p-4 md:p-8">
              {/* Filters Panel */}
              <div
                ref={filtersRef}
                className={cn(
                  "rounded-xl transition-all duration-500 ease-in-out",
                  isFiltersOpen ? "max-h-[100vh] md:max-h-[540px] p-2 md:p-4" : "max-h-0 overflow-hidden"
                )}
              >
                <Filters className="max-h-[400px] overflow-y-auto" />
              </div>
              {/* Settings Panel */}
              <div
                ref={settingsRef}
                className={cn(
                  "rounded-xl transition-all duration-500 ease-in-out",
                  isSettingsOpen ? "max-h-[50vh] md:max-h-96 p-2 md:p-4" : "max-h-0 overflow-hidden"
                )}
              >
                <div className="space-y-4 text-white">
                  <div className="flex items-center justify-between p-1 md:p-2">
                    <span className="text-xs md:text-sm">Composition Grid</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-white/10"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid className={cn("h-4 w-4", showGrid ? "text-blue-400" : "text-white/70")} />
                    </Button>
                  </div>
                  <ComboboxLocation />
                </div>
              </div>
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
                  isSettingsOpen
                    ? "bg-yellow-500 border-yellow-400 text-white hover:bg-yellow-400"
                    : "bg-black/50 border-white/20 text-white hover:border-yellow-400/50"
                )}
                onClick={handleSettingsClick}
              >
                {isSettingsOpen ? (
                  <MapPinPlus className="h-4 md:h-5 w-4 md:w-5" />
                ) : (
                  <MapPin className="h-4 md:h-5 w-4 md:w-5" />
                )}
              </Button>

              {/* Center - Snap Button */}
              <div className="flex flex-col items-center">
                <Button
                  onClick={() => { handleImageProcessing(null, 'camera') }}
                  size="lg"
                  disabled={isLoading}
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

            <MobileControlPanel handleImageProcessing={handleImageProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
}
