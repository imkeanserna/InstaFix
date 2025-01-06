"use client";
import React, { useEffect } from 'react';
import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { DynamicInput } from "@repo/ui/components/ui/dynamic-input";
import { TagInput } from "@repo/ui/components/ui/tag-input";
import { TargetAudience } from "@prisma/client/edge";
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';


export function ServiceDescription() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('service-description');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [experience, setExperience] = React.useState<string>("");
  const [selectedTargetAudience, setSelectedTargetAudience] = React.useState<TargetAudience | null>(null);

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleTagsChange = (tags: string[]) => {
    setSkills(tags);
  };

  const handleTargetAudienceChange = (value: TargetAudience) => {
    const newValue = value === selectedTargetAudience ? null : value;

    setSelectedTargetAudience(newValue);
    if (newValue !== null && skills.length > 0 && experience.length > 10) {
      updateFormData({
        basicInfo: {
          skills: skills,
          experience: experience,
          targetAudience: newValue
        }
      })
    }
  };

  return (
    <div>
      <p>Welcome to service description</p>
      <TagInput
        label="Categories"
        placeholder="Add categories..."
        helperText="Space or enter to add"
        className="w-full max-w-lg"
        onChange={handleTagsChange}
      />
      <DynamicInput
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        placeholder="Add experience..."
        className="w-full max-w-lg"
        onSubmit={() => { }}
      />
      <SelectTargetAudience
        selectedTargetAudience={selectedTargetAudience}
        setSelectedTargetAudience={handleTargetAudienceChange}
      />
    </div>
  );
}

interface SelectTargetAudienceProps {
  selectedTargetAudience: TargetAudience | null;
  setSelectedTargetAudience: (value: TargetAudience) => void;
}

export function SelectTargetAudience({
  selectedTargetAudience,
  setSelectedTargetAudience
}: SelectTargetAudienceProps) {
  const targetAudience = [
    {
      value: TargetAudience.STARTUPS,
      label: "Startups",
      description: "New businesses that need quick and simple solutions.",
    },
    {
      value: TargetAudience.ENTERPRISES,
      label: "Enterprises",
      description: "Big companies that need advanced and reliable services.",
    },
    {
      value: TargetAudience.INDIVIDUALS,
      label: "Individuals",
      description: "Single clients looking for personal help or small projects.",
    },
    {
      value: TargetAudience.NON_PROFITS,
      label: "Non-Profits",
      description: "Charities or social groups needing affordable solutions.",
    },
  ];

  return (
    <Select value={selectedTargetAudience || ''} onValueChange={setSelectedTargetAudience}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a service type" />
      </SelectTrigger>
      <SelectContent>
        {targetAudience.map(({ value, label, description }) => (
          <SelectItem key={value} value={value}>{`${label} (${description})`}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

