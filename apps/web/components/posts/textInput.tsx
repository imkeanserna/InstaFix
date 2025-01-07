"use client";

import { DynamicInput } from "@repo/ui/components/ui/dynamic-input";
import { useEffect, useState } from "react";

interface TextInputProps {
  fieldName: string;
  heading: string;
  subheading?: string;
  minLength: number;
  maxLength: number;
  placeholder: string;
  formData: any;
  updateFormData: (data: any) => void;
  setStepValidity: (isValid: boolean) => void;
}

export function TextPostInput({
  fieldName,
  heading,
  subheading,
  minLength,
  maxLength,
  placeholder,
  formData,
  updateFormData,
  setStepValidity
}: TextInputProps) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
      updateFormData({
        basicInfo: {
          [fieldName]: newValue
        }
      });
    }

    if (newValue.length < minLength) {
      setError(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters long`);
    } else {
      setError("");
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <p>{heading}</p>
        {subheading && <p>{subheading}</p>}
      </div>
      <div className="space-y-1">
        <DynamicInput
          value={value}
          onSubmit={() => { }}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full max-w-lg ${error ? 'border-red-500' : ''}`}
        />
        <div className="flex justify-between items-center">
          <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || '\u00A0'}
          </p>
          <p className="text-sm text-gray-500">
            {value.length}/{maxLength} characters
          </p>
        </div>
      </div>
    </div>
  );
}
