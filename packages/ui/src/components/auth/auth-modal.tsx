"use client";

import { Dialog, DialogContent } from "@repo/ui/components/ui/dialog"
import { FC } from "react";
import { GoogleForm } from "./googleForm";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { useAuthModal } from "@repo/ui/context/AuthModalProvider";

export const AuthModal: FC = () => {
  const { isOpen, closeModal } = useAuthModal();
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md !rounded-3xl px-0 pb-6 pt-6 overflow-hidden">
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 z-0 rounded-full"></div>
        <div className="absolute top-28 left-20 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 z-0 rounded-full"></div>
        <div className="absolute top-28 -right-12 transform -translate-y-1/2 h-64 w-64 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 z-0 rounded-full"></div>
        <div className="relative">
          <Image
            src={"https://pub-e0bfb8aa11494284842ae2b0f72da1ef.r2.dev/screenshot-20250316-073248Z-selected-removebg-preview(1).png"}
            alt={`Message attachment`}
            width={500}
            height={500}
            sizes="100vw"
            className="w-full h-auto object-contain max-h-64 scale-125"
          />
          <div className="absolute inset-0 rounded-xl"></div>
        </div>
        <div className="space-y-10 px-8 mt-6">
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-gray-800"><span className="text-yellow-500">Fix It</span> Fast and See</h2>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Join the Millions Of People Who Have Used
              </p>
              <p>Instafix to Connect With Experts</p>
            </div>
          </div>
          <GoogleForm
            onSuccess={closeModal}
            callbackUrl={pathname}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
