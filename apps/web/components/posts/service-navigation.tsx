"use client";

import { ServiceLocationType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import LocationNavigation, { Location } from "../ui/locationNavigation";
import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { useEffect, useState } from "react";
import { Globe, Users, ArrowLeftRight, Navigation, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export default function ServiceNavigation() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('location');
  const [selectedType, setSelectedType] = useState<ServiceLocationType | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleServiceTypeSelect = (value: ServiceLocationType) => {
    const newValue = value === selectedType ? null : value;

    setSelectedType(newValue);
    if (selectedLocation !== null && newValue !== null) {
      updateFormData({
        location: {
          address: selectedLocation?.address,
          lat: selectedLocation?.lat,
          lng: selectedLocation?.lng,
          serviceLocation: newValue,
        }
      });
    }
  };

  const handleLocationSelect = (value: Location | null) => {
    const newValue = value?.address === selectedLocation?.address ? null : value;
    setSelectedLocation(newValue);
    if (selectedType !== null && newValue !== null) {
      updateFormData({
        location: {
          address: newValue?.address,
          lat: newValue?.lat,
          lng: newValue?.lng,
          serviceLocation: selectedType,
        }
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-yellow-50 py-20 md:py-24">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2 md:space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Discover the Right Service for You
          </h1>
          <p className="text-[10px] md:text-sm text-gray-600">
            Choose your service type and set your preferred location to get started.
          </p>
        </div>

        <div className="flex flex-col space-y-8">
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle className="text-sm md:text-xl">Select Service Type</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ServiceType
                selectedType={selectedType}
                setSelectedType={handleServiceTypeSelect}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle className="text-sm md:text-xl">Select Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <LocationNavigation
                selectedLocation={selectedLocation}
                setSelectedLocation={handleLocationSelect}
                maptilerKey={process.env.MAPTILER_API_KEY}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ServiceTypeProps {
  selectedType: ServiceLocationType | null;
  setSelectedType: (value: ServiceLocationType) => void;
}

const engagementTypes = [
  {
    value: ServiceLocationType.ONLINE,
    label: "Online",
    description: "Remote service delivery",
    icon: Globe,
  },
  {
    value: ServiceLocationType.IN_PERSON,
    label: "In-person",
    description: "Face-to-face service delivery",
    icon: Users,
  },
  {
    value: ServiceLocationType.HYBRID,
    label: "Hybrid",
    description: "Combination of remote and in-person",
    icon: ArrowLeftRight,
  },
]

export function ServiceType({ selectedType, setSelectedType }: ServiceTypeProps) {
  return (
    <Card className="w-full">
      <CardHeader className="p-2">
        <CardDescription>
          Choose how you want to deliver your service
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <Select value={selectedType || ""} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full py-8 text-start">
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {engagementTypes.map(({ value, label, description, icon: Icon }) => (
              <SelectItem
                key={value}
                value={value}
                className="flex flex-col items-start py-3 cursor-pointer "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-muted-foreground">
                      {description}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
