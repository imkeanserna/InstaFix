"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Search } from "lucide-react";

export default function ButtonCommingSoon() {
  return (
    <div className="p-1 relative border border-gray-300 rounded-xl overflow-hidden">
      <div className="w-full group ">
        {/* Inset container */}
        <div className="w-full rounded-xl bg-gray-200 shadow-inner">
          <Button
            variant="outline"
            className="relative px-4 py-7 w-full justify-start text-muted-foreground rounded-xl bg-gray-100 border-gray-300 opacity-80 border-2 borer-gray-300"
          >
            <div className="flex gap-4 items-center justify-center">
              <Search className="text-gray-500" />
              <span className="text-base text-gray-500">Search</span>
            </div>
            <kbd className="pointer-events-none absolute right-4 top-4 hidden h-8 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[12px] font-medium opacity-100 sm:flex">
              <span className="text-base">⌘</span>K
            </kbd>
            <div className="text-[10px] font-semibold absolute right-12 top-1 text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shadow-md">
              Coming Soon...
            </div>
          </Button>
        </div>

        {/* Animated stars in top right corner */}
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
          {/* Star 1 */}
          <div className="absolute top-2 right-4 w-2 h-2 bg-gray-900 rotate-45 animate-pulse-slow"></div>
          {/* Star 2 */}
          <div className="absolute top-4 right-2 w-1 h-1 bg-gray-900 rotate-45 animate-pulse-fast"></div>
          {/* Star 3 */}
          <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-gray-900 rotate-45 animate-twinkle"></div>
          {/* Additional star with shine effect */}
          <div className="absolute top-3 right-8 w-3 h-3 animate-ping-slow opacity-70">
            <div className="absolute inset-0 bg-gray-900 rotate-45"></div>
            <div className="absolute inset-0 bg-gray-900 rotate-45 scale-50"></div>
          </div>
          {/* Tiny decorative stars */}
          <div className="absolute top-8 right-3 w-1 h-1 bg-gray-900 rotate-45 animate-pulse-medium"></div>
          <div className="absolute top-1 right-10 w-0.5 h-0.5 bg-gray-900 rotate-45 animate-pulse-slow"></div>
        </div>

        {/* Static gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 via-yellow-200/10 to-amber-400/20 rounded-xl pointer-events-none"></div>
        {/* Animated gradient that moves from left to right */}
        <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
          <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-yellow-400/0 via-amber-300/50 to-yellow-400/0 rounded-xl animate-gradient-x"></div>
        </div>
        {/* Shimmering effect border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl opacity-20 blur-sm group-hover:opacity-30 transition-opacity"></div>
      </div>
    </div>
  );
}
