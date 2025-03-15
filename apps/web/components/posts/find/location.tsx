"use client";

import LocationNavigation, { Location } from "@/components/ui/locationNavigation";
import { updateUser } from "@/lib/user";
import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useSession } from "next-auth/react";
import { getStoredLocation } from "@/lib/sessionUtils";
import { toast } from "@repo/ui/components/ui/sonner";
import { usePathname } from "next/navigation";

const LocationSchema = z.object({
  address: z.string().min(1, "Full address is required"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export function LocationDialog({
  children,
  onFilterChange
}: {
  children: React.ReactNode;
  onFilterChange: (updates: Partial<{
    location: Location | null;
  }>) => void;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(getStoredLocation());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (pathname.includes("/find") && selectedLocation === null) {
      setOpen(true);
    }
  }, [pathname, selectedLocation]);

  const handleLocationUpdate = async (location: Location) => {
    const locationData = {
      lat: location.lat,
      lng: location.lng,
      address: location.address,
    };
    localStorage.setItem('userLocation', JSON.stringify(locationData));

    if (session) {
      return await updateUser({
        location: {
          fullAddress: location.address,
          latitude: location.lat,
          longitude: location.lng,
        },
      });
    }
    return Promise.resolve({ location: locationData });
  };

  const updateLocationMutation = useMutation({
    mutationFn: handleLocationUpdate,
    onSuccess: (data) => {
      if (session) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
      toast.success('Location updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update location');
    },
  });

  const handleLocationSelect = (value: Location | null) => {
    if (!value) return;

    try {
      LocationSchema.parse(value);
      setSelectedLocation(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleApplyFilters = () => {
    onFilterChange({
      location: selectedLocation
    });
  };

  const handleSubmitLocation = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    try {
      LocationSchema.parse(selectedLocation);
      updateLocationMutation.mutate(selectedLocation);
      handleApplyFilters();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-5xl py-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Select your location
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Select a location to find freelancers near you or within your preferred area.
          </DialogDescription>
          <div className="w-full pt-4">
            <LocationNavigation
              selectedLocation={selectedLocation}
              setSelectedLocation={handleLocationSelect}
              maptilerKey={process.env.MAPTILER_API_KEY}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitLocation}
              disabled={!selectedLocation || updateLocationMutation.isPending}
              className="w-full md:w-auto p-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg shadow-sm transition-colors border border-gray-600"
            >
              {updateLocationMutation.isPending ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

