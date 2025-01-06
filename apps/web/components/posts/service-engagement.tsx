"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { EngagementType } from "@prisma/client/edge";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { useEffect, useState } from "react";

export default function ServiceEngagement() {
  const engagementTypes = [
    {
      value: EngagementType.ONE_TIME_PROJECT,
      label: "One Time Project",
      description: "Deliver a specific task or project",
    },
    {
      value: EngagementType.ONGOING_COLLABORATION,
      label: "Ongoing Collaboration",
      description: "Work on regular or recurring tasks",
    },
    {
      value: EngagementType.CONSULTATION,
      label: "Consultation",
      description: "Provide expert advice or guidance",
    },
    {
      value: EngagementType.CUSTOM_ARRANGEMENT,
      label: "Custom Arrangement",
      description: "Tailor services to fit client-specific needs",
    },
  ];
  const [selectedType, setSelectedType] = useState<EngagementType | null>(null);
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('privacy-type');

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleTypeSelect = (value: EngagementType) => {
    const newValue = value === selectedType ? null : value;
    setSelectedType(newValue);
    updateFormData({ serviceEngagement: [{ engagementType: newValue! }] });
  };

  return (
    <div>
      <ToggleGroup
        type="single"
        value={selectedType || ''}
        onValueChange={handleTypeSelect}
        className="flex flex-col gap-2"
      >
        {engagementTypes.map(({ value, label, description }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className="w-full py-6 rounded-lg border-2 border-gray-300 transition-all hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-100"
          >
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
