"use client";

import { ServicesIncluded } from "@prisma/client/edge";
import { Zap, RefreshCcw, Phone, ClipboardList, Clock, Wallet, Image, Shield } from 'lucide-react';

export function ServicesIncludes({ services }: { services: ServicesIncluded[] }) {
  const serviceDetails = {
    [ServicesIncluded.FAST_TURNAROUND]: { icon: Zap, label: "Fast Turnaround", description: "Quick delivery of your project" },
    [ServicesIncluded.UNLIMITED_REVISIONS]: { icon: RefreshCcw, label: "Unlimited Revisions", description: "Revise until you're satisfied" },
    [ServicesIncluded.FREE_CONSULTATION]: { icon: Phone, label: "Free Consultation", description: "Initial discussion at no cost" },
    [ServicesIncluded.PROJECT_MANAGEMENT_SUPPORT]: { icon: ClipboardList, label: "Project Management", description: "Full project coordination" },
    [ServicesIncluded.AVAILABILITY_24_7]: { icon: Clock, label: "24/7 Availability", description: "Round-the-clock support" },
    [ServicesIncluded.NO_UPFRONT_PAYMENT]: { icon: Wallet, label: "No Upfront Payment", description: "Pay when satisfied" },
    [ServicesIncluded.PROFESSIONAL_PORTFOLIO]: { icon: Image, label: "Professional Portfolio", description: "View past work samples" },
    [ServicesIncluded.MONEY_BACK_GUARANTEE]: { icon: Shield, label: "Money Back Guarantee", description: "100% satisfaction guaranteed" }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h3 className="text-xl sm:text-2xl font-medium px-4 sm:px-0">What this service includes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 px-4 sm:px-8">
        {services.map((service) => {
          const ServiceIcon = serviceDetails[service].icon;
          return (
            <div key={service} className="flex items-start gap-3 sm:gap-5 group">
              <div className="mt-1 shrink-0">
                <ServiceIcon
                  className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-900 fill-yellow-400 group-hover:scale-110 transition-all duration-300"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1 space-y-0.5 sm:space-y-1">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  {serviceDetails[service].label}
                </h4>
                <p className="text-xs text-gray-500">
                  {serviceDetails[service].description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
