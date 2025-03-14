"use client";

import { ServiceLocationType } from "@prisma/client/edge";
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
import { motion } from "framer-motion";

export default function ServiceNavigation() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('location');
  const [selectedType, setSelectedType] = useState<ServiceLocationType | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [pendingLocation, setPendingLocation] = useState<Location | null>(null);

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  // Effect to handle pending location updates when type is selected
  useEffect(() => {
    if (selectedType && pendingLocation) {
      updateFormData({
        location: {
          address: pendingLocation.address,
          lat: pendingLocation.lat,
          lng: pendingLocation.lng,
          serviceLocation: selectedType,
        }
      });
      setPendingLocation(null);
    }
  }, [selectedType, pendingLocation, updateFormData]);

  const handleServiceTypeSelect = (value: ServiceLocationType) => {
    const newValue = value === selectedType ? null : value;
    setSelectedType(newValue);

    if (selectedLocation !== null && newValue !== null) {
      updateFormData({
        location: {
          address: selectedLocation.address,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          serviceLocation: newValue,
        }
      });
    }
  };

  const handleLocationSelect = (value: Location | null) => {
    const newValue = value?.address === selectedLocation?.address ? null : value;
    setSelectedLocation(newValue);

    if (newValue) {
      if (selectedType) {
        updateFormData({
          location: {
            address: newValue.address,
            lat: newValue.lat,
            lng: newValue.lng,
            serviceLocation: selectedType,
          }
        });
      } else {
        // Store the location for when type is selected
        setPendingLocation(newValue);
      }
    }
  };

  // For animation and it uses framer-motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-white to-yellow-50 py-20 md:py-24"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          className="text-center space-y-2 md:space-y-3"
          variants={fadeInUp}
        >
          <motion.h1
            className="text-2xl md:text-3xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Discover the Right Service for You
          </motion.h1>
          <motion.p
            className="text-[10px] md:text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Choose your service type and set your preferred location to get started.
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col space-y-8"
          variants={staggerContainer}
        >
          <motion.div
            variants={cardVariants}
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl">
              <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                    transition={{ duration: 0.5 }}
                  >
                    <Navigation className="w-4 h-4 text-blue-600" />
                  </motion.div>
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
          </motion.div>

          <motion.div
            variants={cardVariants}
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl">
              <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </motion.div>
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
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
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
