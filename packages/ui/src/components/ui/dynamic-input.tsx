"use client";

import React, { useEffect, useRef } from 'react';

interface DynamicInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  onSubmit: (e: React.FormEvent) => void;
  className: string;
}

export const DynamicInput: React.FC<DynamicInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  className
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        if (value.trim()) {
          onSubmit(e);
        }
      }
    }
  };

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`resize-none ${className} p-3 placeholder:text-sm text-sm`}
      rows={1}
    />
  );
};
