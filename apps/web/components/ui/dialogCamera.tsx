"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { ComboboxLocation } from "./locationComboxBox";
import { Camera, Grid, ImagePlus, MapPin, MapPinPlus, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Filters } from "./filters";

export function DiaglogCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const [error, setError] = useState<string>("");
  const settingsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

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
      console.error("Error accessing the camera:", errorMessage);
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
      startCamera();
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

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      // You can handle the captured image here
      // For example, convert to base64:
      // const imageData = canvas.toDataURL('image/jpeg');
      // Or handle as a blob:
      // canvas.toBlob(blob => { /* handle blob */ }, 'image/jpeg');
      alert("Yah")
    }

    handleDialogChange(false);
  };
  const toggleFooter = () => {
    setIsFooterExpanded(!isFooterExpanded);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      const target = event.target as HTMLElement;

      // Ignore clicks on the toggle buttons
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
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ImagePlus className="h-4 w-4" />
          Snap a Fix
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[80vw] h-[90vh] max-w-none max-h-none p-0 border-none">
        {/* Main Camera View */}
        <div className="relative h-full flex justify-center items-center bg-black">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 bg-transparent hover:bg-transparent rounded-full hover:text-gray-200 absolute top-4 right-4"
            onClick={() => handleDialogChange(false)}
          >
            <X className="h-4 w-4 rounded-full" />
          </Button>
          {error ? (
            <div className="text-white text-center p-6 bg-black/60 rounded-lg backdrop-blur-sm">
              <p className="text-red-400 mb-2">Camera Error</p>
              <p className="text-sm opacity-80 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={startCamera}
                className="bg-white/10 hover:bg-white/20"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />

              {/* Focus Area Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="rounded-lg w-4/5 h-4/5 flex items-center justify-center relative">
                      {/* Corner Markers */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-yellow-400/60 rounded-tl" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-yellow-400/60 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-yellow-400/60 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-yellow-400/60 rounded-br" />

                      <div className="text-white/80 text-center space-y-2 bg-black/20 px-6 py-4 rounded-lg backdrop-blur-sm">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-yellow-400/80" />
                        <p className="text-sm font-medium">Center the broken item</p>
                        <p className="text-xs text-yellow-400/80">For the clearest capture</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Camera Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent border-b-4 border-yellow-600">
            <div className="max-w-xl mx-auto p-8">
              {/* Filters Panel */}
              <div
                ref={filtersRef}
                className={cn(
                  "rounded-xl transition-all duration-300",
                  isFiltersOpen ? "max-h-[540px] p-4" : "max-h-0 overflow-hidden"
                )}
              >
                <Filters />
              </div>
              {/* Settings Panel */}
              <div
                ref={settingsRef}
                className={cn(
                  "rounded-xl transition-all duration-300",
                  isSettingsOpen ? "max-h-96 p-4" : "max-h-0 overflow-hidden"
                )}
              >
                <div className="space-y-4 text-white">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm">Composition Grid</span>
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
            <div className="flex items-center justify-center gap-4 p-4">
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
                  <MapPinPlus className="h-5 w-5" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </Button>

              {/* Center - Snap Button */}
              <div className="flex flex-col items-center">
                <Button
                  onClick={captureImage}
                  size="lg"
                  className="rounded-full w-20 h-20 p-0 bg-yellow-500 hover:bg-yellow-400 shadow-lg border-4 border-yellow-400/20 transition-all duration-200 hover:scale-105"
                >
                  <Camera className="h-8 w-8 text-white" />
                </Button>
                <span className="text-yellow-400 text-sm mt-2 font-medium drop-shadow-lg">
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
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
