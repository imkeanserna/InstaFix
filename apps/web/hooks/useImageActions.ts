import { useState, useRef } from 'react';

export interface ObjectDetectionResponse {
  success: boolean;
  error?: string;
}

interface UseImageProcessingOptions {
  onSuccess?: () => void;
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

      if (source === 'camera') {
        if (!videoRef.current) {
          throw new Error("Video reference is missing.");
        }

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        ctx.drawImage(videoRef.current, 0, 0);
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg');
        });
      }

      if (!blob) {
        throw new Error("No image data available");
      }

      const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/object-detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob
      });

      const result: ObjectDetectionResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      options.onSuccess?.();
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
