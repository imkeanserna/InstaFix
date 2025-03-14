"use client";

interface NumericInputProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-8xl'
};

export function NumericInput({
  value,
  onChange,
  placeholder = "0",
  minValue = 0,
  maxValue = 999999,
  className = "",
  size = 'lg'
}: NumericInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = removeCommas(e.target.value);

    if (newValue === '' || /^\d+$/.test(newValue)) {
      const numValue = Number(newValue);
      if (newValue === '' || (numValue >= minValue && numValue <= maxValue)) {
        onChange(newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'];
    const isAllowedKey = allowedKeys.includes(e.key);
    const isNumber = /^[0-9]$/.test(e.key);

    if (!isAllowedKey && !isNumber) {
      e.preventDefault();
    }
  };

  const formatNumberWithCommas = (value: string): string => {
    // Remove any existing commas first
    const numberWithoutCommas = value.replace(/,/g, '');
    return numberWithoutCommas.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  const displayValue = value ? formatNumberWithCommas(value) : '';

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`pl-4 outline-none font-semibold ${sizeClasses[size]} bg-transparent placeholder:text-gray-400 ${className}`}
      inputMode="numeric"
      pattern="\d*"
    />
  );
}

