"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui/components/ui/toggle-group"
import { DualRangeSlider } from '@repo/ui/components/ui/dual-range-slider';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Building2, SquareUser } from "lucide-react";

export function Filters() {
  const [values, setValues] = useState([5, 250]);
  const [minMax, setMinMax] = useState([5, 250]);
  const [workType, setWorkType] = useState("individual");

  return (
    <Card className="w-full bg-white shadow-lg rounded-xl space-y-2">
      <CardHeader className="border-b-2 border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-800 text-center">
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 max-h-[400px] overflow-y-auto">
        {/* Work Type Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-800">Type of work</h3>
            <p className="text-sm text-gray-500">Select your preferred work arrangement</p>
          </div>

          <ToggleGroup
            type="single"
            value={workType}
            onValueChange={(value) => value && setWorkType(value)}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem
              value="individual"
              className="flex items-center justify-center py-8 rounded-xl border-2 border-gray-200 hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-50 transition-all"
            >
              <div className="text-center">
                <div className="flex justify-center items-center gap-2">
                  <SquareUser className="w-6 h-6 text-yellow-500" />
                  <p className="text-lg font-medium text-gray-700">Individual</p>
                </div>
                <p className="text-[10px] text-gray-500">Work directly with a single freelancer</p>
              </div>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="agency"
              className="flex items-center justify-center py-8 rounded-xl border-2 border-gray-200 hover:border-yellow-500 data-[state=on]:border-yellow-500 data-[state=on]:bg-yellow-50 transition-all"
            >
              <div className="text-center">

                <div className="flex justify-center items-center gap-2">
                  <Building2 className="w-6 h-6 text-yellow-500" />
                  <p className="text-lg font-medium text-gray-700">Agency or Team</p>
                </div>
                <p className="text-[10px] text-gray-500">Work with an established company</p>
              </div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Separator */}
        <div className="py-3">
          <Separator />
        </div>

        {/* Price Range Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-800">Price range</h3>
            <p className="text-sm text-gray-500">Hourly rate or project budget</p>
          </div>

          <div className="px-4">
            <DualRangeSlider
              value={[values[0], values[1]]}
              onValueChange={setValues}
              min={minMax[0]}
              max={minMax[1]}
              formatLabel={(value) => `$${value}`}
              showTooltip={true}
              className="[&_.slider-thumb]:bg-yellow-500 [&_.slider-track]:bg-yellow-500"
            />
          </div>
        </div>

        {/* Apply Filters Button */}
      </CardContent>
      <div className="sticky bottom-0 border-t-2 border-gray-100 p-2">
        <button className="w-full p-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-sm transition-colors">
          Apply Filters
        </button>
      </div>
    </Card>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={`w-full h-px bg-gray-200 ${className}`} />;
}
