"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { ChevronRight, X } from 'lucide-react';

export const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

export default function ExpandableDescription({ title, description, maxLength = 400 }: {
  title: string
  description: string
  maxLength?: number
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isLongDescription = description.length > maxLength;
  const truncatedDescription = truncateText(description, maxLength);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col items-end w-full">
        <p className="text-gray-800 leading-8 w-full">
          {truncatedDescription}
        </p>
        {isLongDescription && (
          <Button
            variant="link"
            className="text-gray-900 hover:text-yellow-500 p-0 h-auto font-medium underline underline-offset-2 group flex items-center gap-1 active:scale-[0.98] transition-all duration-300"
            onClick={() => setIsModalOpen(true)}
          >
            Show more
            <ChevronRight className="w-4 h-4 transform transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-full sm:max-w-3xl sm:w-full pt-12 h-full sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
          <DialogClose className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-gray-800 leading-8 whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
