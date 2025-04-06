"use client";

import { LOCATIONSMARKERS } from "@/lib/landingPageUtils";
import { Globe, GlobeMarker } from "@repo/ui/components/ui/globe";

export const NoPostFound = () => {
  return (
    <div className="text-center h-full space-y-8">
      <p className="text-xs text-gray-600 mt-1 mb-3 flex flex-col">
        <span className="font-bold text-sm text-orange-500 italic">No Freelancers nearby.</span> Adjust your location for more options!
      </p>
      <div className="relative flex size-full min-h-[320px] sm:min-h-[370px] md:min-h-[600px] min-w-[320px] sm:min-w-[370px] md:min-w-[600px] 
        items-center justify-center rounded-lg px-40 pb-40 pt-8 md:pb-60"
      >
        <Globe
          markers={LOCATIONSMARKERS as GlobeMarker[]}
        />
      </div>
    </div>
  );
}
