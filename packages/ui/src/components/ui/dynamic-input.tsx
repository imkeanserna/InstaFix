"use client";

import React, { useEffect, useRef } from 'react';

interface DynamicInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  className: string;
}

export const DynamicInput: React.FC<DynamicInputProps> = ({ value, onChange, placeholder, className }) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`resize-none ${className} p-3 placeholder:text-sm text-sm`}
      rows={1}
    />
  );
};
