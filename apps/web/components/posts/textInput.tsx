"use client";

import { DynamicInput } from "@repo/ui/components/ui/dynamic-input";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      className={`space-y-6 ${sizeStyles.wrapper}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h2
          className={`${sizeStyles.heading} font-semibold tracking-tight`}
          layout
        >
          {heading}
        </motion.h2>
        <AnimatePresence>
          {subheading && (
            <motion.p
              className={`${sizeStyles.subheading} text-gray-500`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {subheading}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className={`relative transition-all duration-200 rounded-xl border-2`}
          animate={{
            borderColor: error ? "#EF4444" : isFocused ? "#3B82F6" : "#E5E7EB",
            backgroundColor: error ? "rgba(254, 242, 242, 0.5)" :
              isFocused ? "rgba(219, 234, 254, 0.3)" :
                "rgba(249, 250, 251, 0.5)"
          }}
          whileHover={!error && !isFocused ? {
            borderColor: "#D1D5DB",
            scale: 1.001,
            transition: { duration: 0.2 }
          } : {}}
          layout
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
        </motion.div>

        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className={`px-2 py-1 rounded-md text-xs`}
            animate={{
              backgroundColor: value.length >= maxLength ? "rgb(254, 226, 226)" :
                value.length >= maxLength * 0.8 ? "rgb(254, 243, 199)" :
                  "rgb(243, 244, 246)",
              color: value.length >= maxLength ? "rgb(185, 28, 28)" :
                value.length >= maxLength * 0.8 ? "rgb(161, 98, 7)" :
                  "rgb(75, 85, 99)"
            }}
            whileHover={{ scale: 1.05 }}
            layout
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={`${value.length}/${maxLength}`}
            >
              {value.length}/{maxLength}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
