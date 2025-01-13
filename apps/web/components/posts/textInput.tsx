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
  variant?: 'title' | 'description';
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
  setStepValidity,
  variant = 'description'
}: TextInputProps) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

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

  const sizeStyles = {
    title: {
      wrapper: 'max-w-3xl',
      heading: 'text-3xl md:text-5xl',
      subheading: 'text-sm',
      input: 'min-h-[200px] text-xl md:text-2xl p-8',
    },
    description: {
      wrapper: 'max-w-4xl',
      heading: 'text-3xl md:text-5xl',
      subheading: 'text-sm',
      input: 'min-h-[250px] text-lg md:text-xl p-6',
    }
  }[variant];

  return (
    <div className={`space-y-6 ${sizeStyles.wrapper}`}>
      <div className="space-y-2">
        <h2 className={`${sizeStyles.heading} font-semibold tracking-tight`}>
          {heading}
        </h2>
        {subheading && (
          <p className={`${sizeStyles.subheading} text-gray-500`}>
            {subheading}
          </p>
        )}
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <div
          className={`relative transition-all duration-200 rounded-xl border-2 
            ${error ? 'border-red-500 bg-red-50' : isFocused
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}
        >
          <DynamicInput
            value={value}
            onSubmit={() => { }}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full bg-transparent placeholder:text-gray-400
              resize-none focus:outline-none rounded-xl 
              ${variant === 'title' ? 'capitalize' : ''} 
              leading-loose ${sizeStyles.input}`}
          />
        </div>

        {/* Character Counter */}
        <div className={`px-2 py-1 rounded-md text-xs inline-block
            ${value.length >= maxLength ? 'bg-red-100 text-red-700' :
            value.length >= maxLength * 0.8 ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'}`}
        >
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  );
}
