"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
  onChange?: (tags: string[]) => void;
  tagsInitial?: string[];
}

export function TagInput({
  label,
  placeholder = "Type and press space or enter",
  helperText = "Press space or enter to add",
  className = "w-full max-w-2xl",
  onChange,
  tagsInitial = [],
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(tagsInitial);
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter') && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag) && newTag.length > 2) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        onChange?.(newTags);
        setInputValue('');
      }
    }

    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      onChange?.(newTags);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onChange?.(newTags);
  };

  return (
    <div className={className}>
      {label && <p className="mb-2">{label}</p>}

      <div className="relative">
        <div className="min-h-12 w-full bg-white p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 flex flex-wrap gap-2 items-center">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-blue-200 rounded-full p-1"
                aria-label={`Remove ${tag}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-grow outline-none min-w-[200px] p-1"
          />
        </div>
      </div>

      {helperText && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
