'use client';

import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import { Upload } from "lucide-react";

export function ImageUpload({
  processImage
}: {
  processImage: (imageData: Blob | null, source: 'camera' | 'upload') => Promise<void>;
}) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file, 'upload');
    } else {
      toast.error("No image selected");
    }
  };

  return (
    <div className="flex-shrink-0">
      <Button
        variant="ghost"
        size="lg"
        className="whitespace-nowrap border text-xs border-gray-300 md:hover:border-gray-900 
              dark:border-slate-700 rounded-xl shadow-sm md:hover:bg-yellow-400 dark:hover:bg-slate-800
              p-2 md:p-6 group transition-transform active:scale-95"
        onClick={() => document.getElementById('picture')?.click()}
      >
        <Upload className="md:mr-2 h-4 w-4 md:h5 md:w-5" />
        <span className="hidden md:inline">Select Image</span>
      </Button>
      <input
        id="picture"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
