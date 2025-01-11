"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { EngagementType, RequestConfirmationType } from "@prisma/client/edge";
import { Calendar, Clock, MessagesSquare, RefreshCcw, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { ToggleGroupSelection } from "@repo/ui/components/ui/toggle-group-selection";

export function ServiceEngagement() {
  const engagementTypes = [
    {
      value: EngagementType.ONE_TIME_PROJECT,
      label: "One Time Project",
      description: "Deliver a specific task or project with a clear scope and timeline. Perfect for well-defined objectives.",
      icon: <Clock className="w-6 h-6 text-yellow-500" />
    },
    {
      value: EngagementType.ONGOING_COLLABORATION,
      label: "Ongoing Collaboration",
      description: "Work together regularly on recurring tasks or continuous projects. Ideal for long-term partnerships.",
      icon: <RefreshCcw className="w-6 h-6 text-yellow-500" />
    },
    {
      value: EngagementType.CONSULTATION,
      label: "Consultation",
      description: "Get expert advice and guidance for your specific needs. Perfect for strategic planning and problem-solving.",
      icon: <MessagesSquare className="w-6 h-6 text-yellow-500" />
    },
    {
      value: EngagementType.CUSTOM_ARRANGEMENT,
      label: "Custom Arrangement",
      description: "Create a tailored service package that perfectly matches your unique requirements and preferences.",
      icon: <Settings className="w-6 h-6 text-yellow-500" />
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
    <ToggleGroupSelection
      options={engagementTypes}
      selectedValue={selectedType}
      onSelect={handleTypeSelect}
      toggleGroupClassName="grid-cols-1 md:grid-cols-2 gap-4"
      itemClassName="hover:scale-[1.02] transition-transform duration-200"
    />
  );
}

export default function RequestConfirmation() {
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
