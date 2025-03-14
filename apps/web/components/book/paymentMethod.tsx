"use clients";

import { Button } from "@repo/ui/components/ui/button";
import { Banknote, Check, CreditCard, Lock, Smartphone } from "lucide-react";
import { ReactNode } from 'react';

export const PaymentMethod = () => {
  return (
    <div className="p-0 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
        <div className="flex items-center gap-2 text-gray-500">
          <Lock className="h-4 w-4" />
          <span className="text-xs lg:text-sm">Secure checkout</span>
        </div>
      </div>
      <div className="space-y-4">
        <PaymentOption
          title="MasterCard/Visa"
          description="Secure online payment via credit or debit card."
          icon={<CreditCard className="h-4 w-4 lg:h-7 lg:w-7 text-blue-600" />}
          disabled
          comingSoon
        />
        <PaymentOption
          title="GCash"
          description="Convenient mobile payment through GCash."
          icon={<Smartphone className="h-4 w-4 lg:h-7 lg:w-7 text-green-600" />}
          disabled
          comingSoon
        />
        <PaymentOption
          title="Cash Only"
          description="Pay directly to the freelancer upon service completion."
          icon={<Banknote className="h-4 w-4 lg:h-7 lg:w-7 text-yellow-700" />}
          selected
        />
      </div>
    </div>
  );
};

interface PaymentOptionProps {
  title: string;
  description: string;
  icon: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const PaymentOption = ({
  title,
  description,
  icon,
  selected = false,
  disabled = false,
  comingSoon = false
}: PaymentOptionProps) => {
  return (
    <Button
      variant="outline"
      className={`
        relative w-full p-10 
        ${disabled
          ? 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 border-2 border-gray-200 opacity-70 cursor-not-allowed'
          : 'hover:bg-white border border-gray-900'
        }
        rounded-xl transition-all duration-300 group overflow-hidden flex flex-col sm:flex-row items-start sm:items-center
      `}
      disabled={disabled}
    >
      <div className="absolute inset-0 bg-grid-gray-900/5" />

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 w-full relative">
        {/* Radio Button */}
        <div className={`
          w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex items-center justify-center 
          border-2 
          ${disabled ? 'border-gray-400' : 'border-gray-900'} 
          rounded-full
        `}>
          <div className={`
            w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full
            ${disabled ? 'bg-gray-400' : selected ? 'bg-yellow-500' : 'bg-transparent'}
          `} />
        </div>

        {/* Text Content */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="font-medium text-sm sm:text-base text-gray-900">{title}</p>
            {comingSoon && (
              <span className="px-2 sm:px-3 py-1 bg-gray-200/80 backdrop-blur-sm text-gray-600 rounded-full text-xs sm:text-sm font-medium">
                Coming Soon
              </span>
            )}
            {selected && (
              <span className="px-2 sm:px-3 py-1 bg-yellow-200/80 backdrop-blur-sm text-yellow-700 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                <Check className="h-3 w-3 sm:h-4 sm:w-4" /> Selected
              </span>
            )}
          </div>
          <p className="text-[10px] lg:text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      {/* Icon */}
      <div className={`
        p-2 sm:p-4 rounded-xl shadow-md transition-transform
        ${selected ? 'bg-yellow-200' : 'bg-white'}
        sm:static absolute bottom-3 right-3 ms-3
      `}>
        {icon}
      </div>
    </Button>
  );
};
