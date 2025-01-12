"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu";
import { MoreVertical, Upload, Image as ImageIcon, Plus, GripVertical } from 'lucide-react';
import { MediaType } from '@prisma/client/edge';
import { useFormData } from '@/context/FormDataProvider';
import { useRouteValidation } from '@/hooks/posts/useRouteValidation';
import { PostMedia } from '@repo/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch devices
        tolerance: 8, // 8px movement tolerance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = active.id as number;
      const newIndex = over.id as number;

      const newMedia = arrayMove(media, oldIndex, newIndex);
      const newFiles = arrayMove(files, oldIndex, newIndex);

      setMedia(newMedia);
      setFiles(newFiles);

      // Update cover photo index if needed
      if (coverPhotoIndex === oldIndex) {
        setCoverPhotoIndex(newIndex);
      } else if (coverPhotoIndex === newIndex) {
        setCoverPhotoIndex(oldIndex);
      }

      // Update form data
      updateFormData({
        media: {
          files: newFiles,
          coverPhotoIndex: coverPhotoIndex
        }
      });
    }
  };

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
      <div className={`space-y-8 ${media.length === 0 ? 'text-start' : 'flex justify-between items-center'}`}>
        {media.length === 0 ? (
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              Add some examples of your work
            </h2>
            <p className="text-gray-600 text-sm">
              {`You'll need atleast 1 photo to get started. You can add more or make changes later`}
            </p>
          </div>
        ) : (
          <div className="text-start space-y-2">
            <h2 className="text-3xl font-bold">
              {`Ta-da! How does this look`}
            </h2>
            <p className="text-gray-600 text-sm">
              Drag to reorder photos
            </p>
          </div>
        )}
        {/* Upload Button */}
        <div className={`flex items-center ${media.length > 0 ? 'justify-end' : 'justify-center w-ful'}`}>
          <label className={`cursor-pointer ${media.length > 0
            ? 'group inline-flex items-center px-4 py-2 font-semibold text-gray-950 border border-gray-300 rounded-full hover:bg-gray-100'
            : 'flex flex-col items-center justify-center w-full h-[500px] border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100'}`}>
            {media.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. {maxFileSize / (1024 * 1024)}MB)</p>
              </div>
            ) : (
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-125" />
                <span>Add more</span>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept={allowedFileTypes.join(',')}
              multiple
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {/* Media Gallery */}
      {media.length > 0 && (
        <div className="space-y-4">
          {/* Cover Photo */}
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
            <Image
              src={media[coverPhotoIndex].url}
              alt="Cover Photo"
              fill
              className="object-cover rounded-2xl"
              sizes="100vw"
              draggable={false}
            />
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
              Cover Photo
            </div>
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded-full bg-white/90 hover:bg-white">
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => removeMedia(coverPhotoIndex)}
                    className="text-red-600"
                  >
                    Remove Photo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Additional Photos in Two Columns */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={media.map((_, index) => index)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4">
                {media.map((item, index) => (
                  index !== coverPhotoIndex && (
                    <SortableImage
                      key={index}
                      item={item}
                      index={index}
                      setCoverPhoto={setCoverPhoto}
                      removeMedia={removeMedia}
                    />
                  )
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

interface SortableImageProps {
  item: PostMedia;
  index: number;
  setCoverPhoto: (index: number) => void;
  removeMedia: (index: number) => void;
}

export function SortableImage({ item, index, setCoverPhoto, removeMedia }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="relative group rounded-2xl overflow-hidden touch-manipulation"
    >
      <div className="relative w-full h-[350px]">
        <Image
          src={item.url}
          alt={`Upload ${index + 1}`}
          fill
          className="object-cover rounded-2xl"
          sizes="(max-width: 768px) 50vw, 33vw"
          draggable={false}
        />

        {/* Overlay with drag hint - shown on hover/touch */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg shadow-lg">
              <GripVertical className="w-4 h-4" />
              <span className="text-sm font-medium">Drag to reorder</span>
            </div>
          </div>
        </div>

        {/* Visual feedback while dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-2xl" />
        )}
      </div>

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
  );
}
