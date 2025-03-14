"use client";

import { useImageProcessing } from "@/hooks/useImageActions";
import { Camera, Upload } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

export const GridCamera = React.memo(({ handleImageProcessing, setError }: {
  handleImageProcessing: (imageData: Blob | null, source: 'camera' | 'upload') => void;
  setError: (error: string) => void;
}) => {
  const handleUploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Please select an image under 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    handleImageProcessing(file, 'upload');
  };

  return (
    <div className="absolute inset-0">
      <div className="h-full w-full flex items-center justify-center">
        <div className="rounded-lg w-4/5 h-4/5 flex items-center justify-center relative">
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-yellow-400/60 rounded-tl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-yellow-400/60 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-yellow-400/60 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-yellow-400/60 rounded-br" />

          <div className="text-white/80 text-center bg-black/20 px-8 py-6 rounded-xl backdrop-blur-sm">
            <Camera className="h-8 w-8 mx-auto mb-2 text-yellow-400/80" />
            <p className="text-sm font-medium">Center the broken item</p>
            <p className="text-xs text-yellow-400/80">For the clearest capture</p>

            {/* Upload Button */}
            <div className="relative mt-4  group cursor-pointer hidden md:inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                className="w-full flex items-center justify-center gap-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-200"
                type="button"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400/80 group-hover:text-yellow-400" />
                <span className="text-[10px] sm:text-xs text-white/80 group-hover:text-white">
                  Upload Photo
                </span>
              </button>
            </div>

            {/* Optional text */}
            <p className="text-[8px] text-white/50 mt-2 hidden md:block ">
              Supports JPG, PNG up to 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

GridCamera.displayName = 'GridCamera';
