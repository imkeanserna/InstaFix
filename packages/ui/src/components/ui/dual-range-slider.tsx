'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@repo/ui/lib/utils';
import { Toggle } from './toggle';

interface DualRangeSliderProps {
  className?: string;
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  formatLabel?: (value: number) => string;
  showTooltip?: boolean;
  min: number;
  max: number;
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
}

const generateGraphData = (min: number, max: number, count: number) => {
  const data = [];

  for (let i = 0; i < count; i++) {
    // Random value between min and max (inclusive)
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    data.push({ value });
  }

  return data;
};

const DualRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(({
  className,
  label,
  labelPosition = 'top',
  showTooltip = true,
  min,
  max,
  value = [min, max],
  onValueChange,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const [hoveredThumb, setHoveredThumb] = React.useState<number | null>(null);
  const [graphData, setGraphData]: any = React.useState([]);
  const [isUSD, setIsUSD] = React.useState(true);

  const formatLabel = (val: number) => {
    return isUSD ? `$${val}` : `₱${val}`;
  };

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);


  React.useEffect(() => {
    if (graphData.length === 0) {
      setGraphData(generateGraphData(min, max, 20));
    }
  }, []);

  const handleValueChange = (newValue: [number, number]) => {
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="px-4 pt-2 pb-4 space-y-6">
      {/* Currency Toggle and Label */}
      <div className="flex justify-between items-center">
        {label && labelPosition === 'top' && (
          <div className="text-lg font-semibold">{label}</div>
        )}
        <div className="flex gap-2">
          <Toggle
            pressed={isUSD}
            onPressedChange={() => setIsUSD(true)}
            className={cn(
              "data-[state=on]:bg-yellow-500",
              "data-[state=on]:text-white"
            )}
          >
            USD
          </Toggle>
          <Toggle
            pressed={!isUSD}
            onPressedChange={() => setIsUSD(false)}
            className={cn(
              "data-[state=on]:bg-yellow-500",
              "data-[state=on]:text-white"
            )}
          >
            PHP
          </Toggle>
        </div>
      </div>

      {/* Label */}
      {label && labelPosition === 'top' && (
        <div className="text-center text-lg font-semibold">{label}</div>
      )}

      <div className="flex justify-between">
        <span className="text-sm font-medium text-gray-600">{formatLabel(min)}</span>
        <span className="text-sm font-medium text-gray-600">{formatLabel(max)}</span>
      </div>

      {/* Bar Graph */}
      <div className="flex flex-col items-center space-y-8">
        <div className="relative flex items-end justify-center space-x-1 h-24 w-full max-w-lg">
          {graphData.map((dataPoint: { value: number }, idx: number) => {
            const barHeight = (dataPoint.value / Math.max(...graphData.map((d: { value: number }) => d.value))) * 100;
            const isSelected =
              dataPoint.value >= value[0] && dataPoint.value <= value[1];

            return (
              <div
                key={idx}
                className={cn(
                  "w-4 rounded-md transition-all",
                  isSelected ? "bg-yellow-500" : "bg-gray-300"
                )}
                style={{ height: `${barHeight}%` }}
              >
                <span className="sr-only">{dataPoint.value}</span>
              </div>
            );
          })}
        </div>

        {/* Slider */}
        <SliderPrimitive.Root
          ref={ref}
          min={min}
          max={max}
          value={internalValue}
          onValueChange={handleValueChange}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            className
          )}
          {...props}
        >
          {/* Track */}
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
            {/* Active Range */}
            <SliderPrimitive.Range className="absolute h-full bg-yellow-500 transition-all" />
          </SliderPrimitive.Track>

          {/* Thumbs */}
          {internalValue.map((thumbValue, index) => (
            <React.Fragment key={index}>
              <SliderPrimitive.Thumb
                key={index}
                className={cn(
                  "relative block h-5 w-5 rounded-full border-2 border-yellow-500 bg-white shadow-lg",
                  "ring-offset-background transition-all duration-100",
                  "hover:scale-110 hover:border-yellow-600",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
                onMouseEnter={() => setHoveredThumb(index)}
                onMouseLeave={() => setHoveredThumb(null)}
              >
                {/* Tooltip */}
                {showTooltip && (
                  <div
                    className={cn(
                      "absolute -top-8 left-1/2 -translate-x-1/2 transition-all duration-100",
                      hoveredThumb === index ? "opacity-100 transform -translate-y-1" : "opacity-0"
                    )}
                  >
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                      {formatLabel(thumbValue)}
                    </div>
                    <div className="w-2 h-2 bg-yellow-500 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                )}
              </SliderPrimitive.Thumb>
            </React.Fragment>
          ))}
        </SliderPrimitive.Root>

        {/* Display the selected range */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">
            Range: ${value[0]} - ${value[1]}
          </span>
        </div>
      </div>
    </div>
  );
});

DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };
