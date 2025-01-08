"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { PricingType } from "@prisma/client/edge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { useEffect, useState } from "react";
import { NumericInput } from "@repo/ui/components/ui/numeric-input";

type Currency = 'USD' | 'PHP';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  PHP: '₱'
};

export function PricingSetup() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('price');
  const [selectedPricingType, setSelectedPricingType] = useState<PricingType | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handlePricingTypeSelect = (value: PricingType) => {
    const newValue = value === selectedPricingType ? null : value;
    setSelectedPricingType(newValue);

    if (price !== null && newValue !== null) {
      updateFormData({
        pricing: {
          pricingType: newValue,
          hourlyRate: selectedPricingType === PricingType.HOURLY ? Number(price) : 0,
          fixedPrice: selectedPricingType === PricingType.FIXED_PRICE ? Number(price) : 0
        }
      });
    }
  }

  const handlePriceChange = (value: string) => {
    setPrice(value);
    if (selectedPricingType !== null && value !== null) {
      updateFormData({
        pricing: {
          pricingType: selectedPricingType,
          hourlyRate: selectedPricingType === PricingType.HOURLY ? Number(value) : 0,
          fixedPrice: selectedPricingType === PricingType.FIXED_PRICE ? Number(value) : 0
        }
      });
    }
  }

  return (
    <div>
      <p>Pricing Setup</p>
      <PricingSelectionType
        selectedPricingType={selectedPricingType}
        setSelectedPricingType={handlePricingTypeSelect}
      />
      {selectedPricingType && (
        <div className="flex items-center gap-2">
          <Select value={currency} onValueChange={() => setCurrency(currency === 'USD' ? 'PHP' : 'USD')}>
            <SelectTrigger className="w-[80px]">
              <SelectValue>{currencySymbols[currency]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">$</SelectItem>
              <SelectItem value="PHP">₱</SelectItem>
            </SelectContent>
          </Select>

          <div className={`relative flex items-center`}>
            <span className="pointer-events-none font-semibold text-8xl">
              {currencySymbols[currency]}
            </span>
            <div className="ms-[-16px]">
              <NumericInput
                value={price}
                onChange={handlePriceChange}
                placeholder="0"
                minValue={0}
                maxValue={999999}
                size="lg"
              />
            </div>
            {selectedPricingType === PricingType.HOURLY && (
              <span className="text-2xl text-gray-500">/hr</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface PricingSelectionTypeProps {
  selectedPricingType: PricingType | null;
  setSelectedPricingType: (value: PricingType) => void;
}

export function PricingSelectionType({ selectedPricingType, setSelectedPricingType }: PricingSelectionTypeProps) {
  const engagementTypes = [
    {
      value: PricingType.HOURLY,
      label: "Hourly Rate",
      description: "Set a price per hour for your service",
      available: true
    },
    {
      value: PricingType.FIXED_PRICE,
      label: "Fixed Price",
      description: "Set a price for your service",
      available: true
    },
    {
      value: PricingType.CUSTOM,
      label: "Custom Pricing",
      description: "Allow clients to inquire for a custom price",
      available: false
    },
    {
      value: PricingType.PACKAGE,
      label: "Package Pricing",
      description: "Offer different packages based on your project scope",
      available: false
    }
  ];

  const handlePricingTypeChange = (value: PricingType) => {
    const selectedType = engagementTypes.find(type => type.value === value);
    if (selectedType?.available) {
      setSelectedPricingType(value);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={selectedPricingType || ''} onValueChange={handlePricingTypeChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a pricing type" />
        </SelectTrigger>
        <SelectContent>
          {engagementTypes.map(({ value, label, description, available }) => (
            <SelectItem
              key={value}
              value={value}
              className={!available ? 'opacity-50 cursor-not-allowed' : ''}
              disabled={!available}
            >
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-sm text-gray-500">{description}</div>
                {!available && (
                  <div className="text-xs text-yellow-600">Coming Soon</div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

