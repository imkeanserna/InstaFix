"use client"

import * as React from "react"
import { cn } from "@repo/ui/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command"
import { Check, MapPin } from "lucide-react";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const

export function ComboboxLocation() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleGroupClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div className="w-full" onBlur={handleBlur}>
      <Command className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div
          className={cn(
            "px-4 py-3 cursor-pointer transition-all duration-200",
            open && "bg-gray-50"
          )}
          onClick={handleGroupClick}
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Select Location
            </span>
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-2 bg-white rounded-md">
            <CommandInput
              ref={inputRef}
              placeholder={value
                ? languages.find((framework) => framework.value === value)?.label
                : "Search for a repair location..."}
              className={cn(
                "h-8 p-0 border-0 text-sm",
                "bg-transparent text-gray-900 placeholder:text-gray-400",
                "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
              onFocus={handleFocus}
            />
          </div>
        </div>
        {/* Dropdown List */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            open ? "max-h-[250px] border-t border-gray-100" : "max-h-0"
          )}
        >
          <CommandList className="max-h-[250px] overflow-y-auto bg-white py-1">
            <CommandEmpty className="py-4 text-sm text-gray-500 text-center">
              No locations found in this area
            </CommandEmpty>
            <CommandGroup>
              {languages.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    if (inputRef.current) {
                      inputRef.current.blur();
                    }
                  }}
                  className={cn(
                    "cursor-pointer py-2.5 px-4",
                    "text-gray-700 hover:text-gray-900",
                    "hover:bg-gray-50 transition-colors",
                    value === framework.value && "bg-yellow-50 text-yellow-700"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{framework.label}</span>
                      <span className="text-xs text-gray-500">Available for repairs</span>
                    </div>
                  </div>
                  {value === framework.value && (
                    <Check className="ml-auto h-4 w-4 text-yellow-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </div>
      </Command>
    </div>
  );
}
