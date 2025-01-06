"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { ServicesIncluded } from "@prisma/client";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { useEffect, useState } from "react";

export default function ServiceOffer() {
  const [selectedSpecialOffers, setSelectedSpecialOffers] = useState<ServicesIncluded[]>([]);
  const specialOffers = [
    {
      value: ServicesIncluded.FAST_TURNAROUND,
      label: "Fast Turnaround"
    },
    {
      value: ServicesIncluded.UNLIMITED_REVISIONS,
      label: "Unlimited Revisions"
    },
    {
      value: ServicesIncluded.FREE_CONSULTATION,
      label: "Free Consultation"
    },
    {
      value: ServicesIncluded.PROJECT_MANAGEMENT_SUPPORT,
      label: "Project Management Support"
    },
    {
      value: ServicesIncluded.AVAILABILITY_24_7,
      label: "24/7 Availability"
    },
    {
      value: ServicesIncluded.NO_UPFRONT_PAYMENT,
      label: "No Upfront Payment"
    },
    {
      value: ServicesIncluded.PROFESSIONAL_PORTFOLIO,
      label: "Professional Portfolio"
    },
    {
      value: ServicesIncluded.MONEY_BACK_GUARANTEE,
      label: "Money Back Guarantee"
    }
  ]
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('special-features');

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleValueChange = (value: ServicesIncluded[]) => {
    setSelectedSpecialOffers(value);
    if (value.length > 0) {
      updateFormData({
        basicInfo: {
          servicesIncluded: value
        }
      });
    };
  }

  return (
    <div>
      <p>Tell clients what your service includes</p>
      <ToggleGroup
        type="multiple"
        value={selectedSpecialOffers}
        onValueChange={handleValueChange}
        className="grid gap-4 md:grid-cols-2"
      >
        {specialOffers.map(({ value, label }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className="flex items-center justify-center py-6 rounded-lg border-2 border-gray-300 transition-all hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-100"
          >
            <p className="text-sm font-medium">{label}</p>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
