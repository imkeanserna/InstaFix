import { objectDetection } from '@/lib/objecteDetectionUtils';
import { Subcategory } from '@prisma/client/edge';
import { useState, useRef } from 'react';

interface UseImageProcessingOptions {
  onSuccess?: ({
    detected,
    professions,
    subCategories
  }: {
    detected: string;
    professions: string[];
    subCategories: Subcategory[] | null
  }) => void;
  onError?: (error: string) => void;
  externalErrorSetter?: (error: string) => void;
}

export const useImageProcessing = (options: UseImageProcessingOptions = {}) => {
  const [internalError, setInternalError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleError = (errorMessage: string) => {
    setInternalError(errorMessage);

    if (options.externalErrorSetter) {
      options.externalErrorSetter(errorMessage);
    }
    options.onError?.(errorMessage);
  };

  const processImage = async (imageData: Blob | null, source: 'camera' | 'upload') => {
    setIsLoading(true);
    setInternalError("");
    if (options.externalErrorSetter) {
      options.externalErrorSetter("");
    }

    try {
      let blob = imageData;

      if (!blob) {
        throw new Error("No image data available");
      }

      const result = await objectDetection(blob);
      options.onSuccess?.(result);
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred';
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processImage,
    isLoading,
    error: internalError,
    videoRef
  };
};
