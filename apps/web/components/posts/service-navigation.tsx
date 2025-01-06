"use client";

import { ServiceLocationType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import LocationNavigation, { Location } from "../ui/locationNavigation";
import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { useEffect, useState } from "react";

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
    <div>
      <p>Welcome to service navigation</p>
      <ServiceType
        selectedType={selectedType}
        setSelectedType={handleServiceTypeSelect}
      />
      <LocationNavigation
        selectedLocation={selectedLocation}
        setSelectedLocation={handleLocationSelect}
        maptilerKey={process.env.MAPTILER_API_KEY}
      />
    </div>
  );
}

interface ServiceTypeProps {
  selectedType: ServiceLocationType | null;
  setSelectedType: (value: ServiceLocationType) => void;
}

export function ServiceType({ selectedType, setSelectedType }: ServiceTypeProps) {
  const engagementTypes = [
    {
      value: ServiceLocationType.ONLINE,
      label: "Online",
      description: "Remote service",
    },
    {
      value: ServiceLocationType.IN_PERSON,
      label: "In-person",
      description: "Local service",
    },
    {
      value: ServiceLocationType.HYBRID,
      label: "Hybrid",
      description: "Remote and local service",
    }
  ];

  return (
    <Select value={selectedType || ''} onValueChange={setSelectedType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a service type" />
      </SelectTrigger>
      <SelectContent>
        {engagementTypes.map(({ value, label, description }) => (
          <SelectItem key={value} value={value}>{`${label} (${description})`}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
