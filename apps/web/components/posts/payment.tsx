"use client";

import React from 'react';
import { LockIcon, CreditCard, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export function PaymentMethodsSetup() {
  return (
    <div className="h-full bg-gradient-to-b from-white to-yellow-50 py-24">
      <div className="max-w-3xl mx-auto relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Header Section */}
        <div className="mb-12 relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Payment Methods
          </h1>
          <p className="text-sm text-gray-600">
            Securely manage your payment information
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-white/20">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-sm" />
            <div className="relative flex items-center">
              <AlertCircle className="h-6 w-6 mr-3" />
              <div>
                <h2 className="font-semibold text-xl">
                  Payment System Update in Progress
                </h2>
                <p className="mt-1 opacity-90 text-sm">
                  {`We're enhancing our payment infrastructure`}
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-4 shadow-lg">
                <CreditCard className="h-8 w-8 text-indigo-600" />
              </div>
            </div>

            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Payment Methods Temporarily Unavailable
              </h3>
              <p className="text-gray-600 mb-6">
                {`We're working on bringing you an enhanced payment experience with improved security and more payment options.`}
              </p>

              <div className="bg-gradient-to-r from-gray-50 to-white/80 rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-gray-600 shadow-sm border border-white/50">
                <LockIcon className="h-4 w-4" />
                <span>Bank-level security & encryption</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/20 p-6 bg-gradient-to-b from-gray-50/50 to-white/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Expected availability: Coming soon
              </span>
              <div className="flex items-center gap-3">
                <Image
                  src="/payment/visa.png"
                  alt="Visa"
                  width={32}
                  height={20}
                  className="h-5 opacity-50 hover:opacity-100 transition-opacity"
                  sizes="(max-width: 640px) 100vw, 
                   (max-width: 768px) 50vw,
                   (max-width: 1024px) 33vw,
                   25vw"
                />
                <Image
                  src="/payment/mastercard.png"
                  alt="Mastercard"
                  width={32}
                  height={20}
                  className="h-5 opacity-50 hover:opacity-100 transition-opacity"
                  sizes="(max-width: 640px) 100vw, 
                   (max-width: 768px) 50vw,
                   (max-width: 1024px) 33vw,
                   25vw"
                />
                <Image
                  src="/payment/amex.png"
                  alt="Amex"
                  width={32}
                  height={20}
                  className="h-5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                  sizes="(max-width: 640px) 100vw, 
                   (max-width: 768px) 50vw,
                   (max-width: 1024px) 33vw,
                   25vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
