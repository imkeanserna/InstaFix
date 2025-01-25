"use client";

import { DualRangeSlider } from '@repo/ui/components/ui/dual-range-slider';
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { SlidersHorizontal } from "lucide-react";
import LocationNavigation, { Location } from "./locationNavigation";
import { engagementTypes } from "../posts/service-engagement";
import { SelectTargetAudience } from "../posts/service-description";
import { specialOffers, ToggleGrid } from "../posts/service-offer";
import { EngagementType, PricingType, ServicesIncluded, TargetAudience } from "@prisma/client/edge";
import { PricingSelectionType } from "../posts/pricing-setup";
import { ToggleGroupSelection } from "@repo/ui/components/ui/toggle-group-selection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { AnimatePresence, motion, PanInfo, useAnimation } from 'framer-motion'
import { Button } from "@repo/ui/components/ui/button";
import { useMediaQuery } from "@/hooks/useMedia";

export interface FiltersProps {
  initialState: {
    location: Location | null;
    priceMin: number | null;
    priceMax: number | null;
    pricingType: PricingType;
    engagementType: EngagementType;
    targetAudience: TargetAudience;
    servicesIncluded: ServicesIncluded[];
  };
  onFilterChange: (filters: Partial<FiltersProps['initialState']>) => void;
  className?: string;
}

export const FilterDrawerWrapper = ({ initialState, onFilterChange, className }: FiltersProps) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <>
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="px-4 py-7 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg z-50 transition-all duration-200 hover:scale-110"
      >
        <SlidersHorizontal className="w-6 h-6" />
      </Button>
      <AnimatePresence>
        {isVisible && (
          <Filters
            initialState={initialState}
            onFilterChange={onFilterChange}
            className={className}
            onClose={() => setIsVisible(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const Filters = React.memo(({ initialState, onFilterChange, className, onClose }:
  FiltersProps &
  { onClose: () => void; }
) => {
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [values, setValues] = useState([
    initialState.priceMin ?? 5,
    initialState.priceMax ?? 250
  ]);
  const [minMax, setMinMax] = useState([5, 250]);
  const [selectedPricingType, setSelectedPricingType] = useState<PricingType | null>(
    initialState.pricingType
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialState.location
  );
  const [selectedType, setSelectedType] = useState<EngagementType | null>(
    initialState.engagementType
  );
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<TargetAudience | null>(
    initialState.targetAudience
  );
  const [selectedSpecialOffers, setSelectedSpecialOffers] = useState<ServicesIncluded[]>(
    initialState.servicesIncluded
  );

  // Drawer state
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawer heights
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const minHeight = 100;
  const mediumHeight = window.innerHeight * 0.5;
  const maxHeight = isLargeScreen ? '90vh' : '100vh';

  const springTransition = {
    type: "spring",
    damping: 30,
    stiffness: 300,
    mass: 0.8
  };

  const drawerVariants = {
    hidden: {
      y: "100%",
      height: minHeight,
      transition: springTransition
    },
    visible: {
      y: 0,
      height: maxHeight,
      transition: springTransition
    },
    exit: {
      y: "100%",
      transition: { ...springTransition, duration: 0.3 }
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentOffset = info.offset.y;

    if (isMapInteracting) {
      return;
    }

    if (velocity > 500 || currentOffset > 200) {
      // Close the drawer completely if swiped down fast or far enough
      onClose();
    } else if (velocity < -500 || currentOffset < -200) {
      // Open fully if swiped up fast or far enough
      controls.start({ height: maxHeight });
      setIsOpen(true);
    } else {
      // Snap to nearest position
      const currentHeight = containerRef.current?.getBoundingClientRect().height || 0;
      if (currentHeight < mediumHeight) {
        controls.start({ height: minHeight });
        setIsOpen(false);
      } else {
        controls.start({ height: maxHeight });
        setIsOpen(true);
      }
    }
  };

  const handleApplyFilters = () => {
    onFilterChange({
      location: selectedLocation,
      priceMin: values[0],
      priceMax: values[1],
      pricingType: selectedPricingType!,
      engagementType: selectedType!,
      targetAudience: selectedTargetAudience!,
      servicesIncluded: selectedSpecialOffers
    });
    onClose();
  };

  const handlePricingTypeChange = (type: PricingType) => {
    if (selectedPricingType === type) {
      setSelectedPricingType(null);
      // Reset to default values when deselecting
      setMinMax([5, 250]);
      setValues([5, 250]);
      return;
    }

    setSelectedPricingType(type);
    switch (type) {
      case PricingType.HOURLY:
        setMinMax([5, 250]);
        setValues([5, 250]);
        break;
      case PricingType.FIXED_PRICE:
        setMinMax([100, 10000]);
        setValues([100, 10000]);
        break;
      default:
        setMinMax([5, 250]);
        setValues([5, 250]);
    }
  };

  // for location
  const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
  const handleLocationSelect = (value: Location | null) => {
    const newValue = value?.lat === selectedLocation?.lat
      && value?.lng === selectedLocation?.lng
      ? null : value;
    setSelectedLocation({
      lat: value?.lat || 0,
      lng: value?.lng || 0,
      address: value?.address || '',
    });

    if (newValue) {
      if (selectedType) {
      } else {
        // Store the location for when type is selected
        setPendingLocation(newValue);
      }
    }
  };

  // service description
  const handleTargetAudienceChange = (value: TargetAudience) => {
    const newValue = value === selectedTargetAudience ? null : value;
    setSelectedTargetAudience(newValue);
  };

  // Work type ToggleGroupSelection
  const handleTypeSelect = (value: EngagementType) => {
    const newValue = value === selectedType ? null : value;
    setSelectedType(newValue);
  };

  // Speciial offer ToggleGrid
  const handleValueChange = (value: ServicesIncluded[]) => {
    setSelectedSpecialOffers(value);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={containerRef}
      variants={drawerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      drag={!isMapInteracting ? "y" : false}
      dragConstraints={{ top: 0, bottom: window.innerHeight - minHeight }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="fixed border-t-2 border-gray-100 bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
    >
      {/* Drawer Handle */}
      <div
        className="pt-4 pb-2 cursor-pointer"
        onClick={onClose}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto transition-colors hover:bg-gray-400" />
      </div>

      {/* Content */}
      <motion.div
        className="overflow-y-auto h-full pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="border-none shadow-none">
          <CardHeader className="border-b-2 border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800 text-center">
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-6 py-6 lg:py-10 px-6 lg:px-36 ${className}`}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Location</h3>
              <p className="text-sm text-gray-500">
                Select a location to find freelancers near you or within your preferred area.
              </p>
              <LocationNavigation
                selectedLocation={selectedLocation}
                setSelectedLocation={handleLocationSelect}
                maptilerKey={process.env.MAPTILER_API_KEY}
                setIsMapInteracting={setIsMapInteracting}
              />
            </div>

            <div className="py-3">
              <Separator />
            </div>

            {/* Price Range Section */}
            <div className="space-y-6 pb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Pricing Type</h3>
                <p className="text-sm text-gray-500">
                  Choose how you’d like to see pricing: by hourly rates or total project budget.
                </p>
                <PricingSelectionType
                  selectedPricingType={selectedPricingType}
                  setSelectedPricingType={handlePricingTypeChange}
                />
              </div>

              {selectedPricingType && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      {selectedPricingType === PricingType.HOURLY
                        ? "Hourly rate range"
                        : "Project budget range"}
                    </p>
                  </div>
                  <div className="px-4">
                    <DualRangeSlider
                      value={[values[0], values[1]]}
                      onValueChange={setValues}
                      min={minMax[0]}
                      max={minMax[1]}
                      formatLabel={(value) => `$${value}`}
                      showTooltip={true}
                      className="[&_.slider-thumb]:bg-yellow-500 [&_.slider-track]:bg-yellow-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8 border-t">
                  Engagement Type
                </AccordionTrigger>
                <AccordionContent className="overflow-visible px-1 pt-4 pb-12">
                  <div className="p-1">
                    <ToggleGroupSelection
                      options={engagementTypes}
                      selectedValue={selectedType}
                      onSelect={handleTypeSelect}
                      toggleGroupClassName="grid-cols-1 md:grid-cols-2 gap-4"
                      itemClassName="hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8">
                  Target Audience
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-12">
                  <SelectTargetAudience
                    selectedTargetAudience={selectedTargetAudience}
                    setSelectedTargetAudience={handleTargetAudienceChange}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-none">
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-8">
                  Services Included
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-12">
                  <div className="p-1">
                    <ToggleGrid
                      options={specialOffers}
                      selectedValues={selectedSpecialOffers}
                      onValueChange={handleValueChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Apply Filters Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button
          onClick={handleApplyFilters}
          className="w-full py-8 bg-yellow-500 text-lg hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          Apply Filters
        </Button>
      </motion.div>
    </motion.div>
  );
});

Filters.displayName = "Filters";

export function Separator({ className }: { className?: string }) {
  return <div className={`w-full h-px bg-gray-200 ${className}`} />;
}
