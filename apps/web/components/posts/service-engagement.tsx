"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { EngagementType, RequestConfirmationType } from "@prisma/client/edge";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { ToggleGroupSelection } from "@repo/ui/components/ui/toggle-group-selection";

export function ServiceEngagement({ title, subtitle }: { title: string, subtitle: string }) {
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <ToggleGroupSelection
        options={engagementTypes}
        selectedValue={selectedType}
        onSelect={handleTypeSelect}
      />
    </div>
  );
}

export default function RequestConfirmation({ title, subtitle }: { title: string, subtitle: string }) {
  const requestConfirmationTypes = [
    {
      value: RequestConfirmationType.INSTANT_BOOK,
      label: "Use Instant Book",
      description: "Client can book automatically",
      icon: <Clock className="w-6 h-6 text-yellow-500" />
    },
    {
      value: RequestConfirmationType.APPROVE_DECLINE,
      label: "Approve/Decline requests",
      description: "Client must ask for approval or decline",
      icon: <Calendar className="w-6 h-6 text-yellow-500" />
    }
  ];

  const [selectedRequest, setSelectedRequest] = useState<RequestConfirmationType | null>(null);
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('instant-book');

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleRequestSelect = (value: RequestConfirmationType) => {
    const newValue = value === selectedRequest ? null : value;
    setSelectedRequest(newValue);
    if (newValue) {
      updateFormData({
        basicInfo: {
          requestConfirmation: newValue
        }
      });
    }
  };

  return (
    <ToggleGroupSelection
      options={requestConfirmationTypes}
      selectedValue={selectedRequest}
      onSelect={handleRequestSelect}
    />
  );
}
