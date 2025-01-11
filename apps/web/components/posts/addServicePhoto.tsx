"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu";
import { MoreVertical, Upload, Image as ImageIcon } from 'lucide-react';
import { MediaType } from '@prisma/client/edge';
import { useFormData } from '@/context/FormDataProvider';
import { useRouteValidation } from '@/hooks/posts/useRouteValidation';
import { PostMedia } from '@repo/types';

interface AddServicePhotoProps {
  maxFileSize?: number;
  maxPhotos?: number;
  allowedFileTypes: string[];
}

export function AddServicePhoto({
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxPhotos = 10,
  allowedFileTypes,
}: AddServicePhotoProps) {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('photos');
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const validateFile = (file: File): boolean => {
    if (!allowedFileTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG or JPEG files only.');
      return false;
    }

    if (file.size > maxFileSize) {
      setError(`File size should not exceed ${maxFileSize / (1024 * 1024)}MB`);
      return false;
    }

    if (media.length >= maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    const validFiles: File[] = [];

    newFiles.forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          const newMedia = [...media, {
            url: reader.result as string,
            type: MediaType.IMAGE
          }];
          setMedia(newMedia);
        };
        reader.readAsDataURL(file);
      }
    });
    // Update files state with valid files
    setFiles(prevFiles => [...prevFiles, ...validFiles]);

    if (validFiles.length > 0) {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });
      updateFormData({
        media: {
          files: [...files, ...validFiles],
          coverPhotoIndex: coverPhotoIndex
        }
      });
    }

    // Reset input value to allow uploading the same file again
    event.target.value = '';
  };

  const removeMedia = (indexToRemove: number) => {
    const newMedia = media.filter((_, index) => index !== indexToRemove);
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setMedia(newMedia);
    setFiles(newFiles);

    updateFormData({
      media: {
        files: newFiles,
        coverPhotoIndex: coverPhotoIndex
      }
    });

    if (coverPhotoIndex === indexToRemove) {
      setCoverPhotoIndex(0);
    }
  };

  const setCoverPhoto = (index: number) => {
    setCoverPhotoIndex(index);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Add Service Photo</h2>

        {/* Upload Button */}
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. {maxFileSize / (1024 * 1024)}MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={allowedFileTypes.join(',')}
              multiple
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>

      {/* Media Gallery */}
      {media.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item, index) => (
            <div
              key={index}
              className={`relative group rounded-lg overflow-hidden ${index === coverPhotoIndex ? 'ring-2 ring-blue-500' : ''
                }`}
            >
              <div className="relative w-full h-48">
                <Image
                  src={item.url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 
                         (max-width: 768px) 50vw,
                         (max-width: 1024px) 33vw,
                         25vw"
                />
              </div>

              {/* Cover Photo Badge */}
              {index === coverPhotoIndex && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
                  Cover Photo
                </div>
              )}

              {/* Actions Menu */}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1 rounded-full bg-white/90 hover:bg-white">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCoverPhoto(index)}>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Make Cover Photo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => removeMedia(index)}
                      className="text-red-600"
                    >
                      Remove Photo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
