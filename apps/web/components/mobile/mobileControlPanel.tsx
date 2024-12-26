"use client";

import { BottomPanel } from "@repo/ui/components/ui/bottom-pannel";
import { Button } from "@repo/ui/components/ui/button";
import { Camera } from "lucide-react";
import { Filters } from "../ui/filters";
import React from "react";

interface MobileControlPanelProps {
  handleImageProcessing: (imageData: Blob | null, source: 'camera' | 'upload') => void;
}

export const MobileControlPanel = React.memo(({ handleImageProcessing }: MobileControlPanelProps) => {
  return (
    <div className="md:hidden relative">
      <div className="absolute bottom-1 left-0 right-0 h-16 p-2 flex justify-center items-center">
        <Button
          onClick={() => { handleImageProcessing(null, 'camera') }}
          variant="outline"
          size="lg"
          className="z-10 w-full rounded-lg py-7 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-500 text-white hover:text-white border-none shadow-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          <span className="text-xl">Snap It</span>
        </Button>
      </div>
      <BottomPanel>
        <div className="pb-4">
          <Filters />
        </div>
      </BottomPanel>
    </div>
  );
});

MobileControlPanel.displayName = "MobileControlPanel";
