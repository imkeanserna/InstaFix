"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

import { cn } from "@repo/ui/lib/utils"

const ICONS = {
  info: AlertCircle,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle
};

export const Alert = React.forwardRef<
  HTMLDivElement,
  {
    type: 'info' | 'success' | 'error' | 'warning';
    title: string;
    body: string;
    className?: string;
  }
>(({ type, title, body, className, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = ICONS[type];

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    info: {
      gradient: 'from-blue-500/10 via-blue-500/20 to-blue-500/10',
      border: 'border-l-blue-500',
      text: 'text-blue-400',
    },
    success: {
      gradient: 'from-green-500/10 via-green-500/20 to-green-500/10',
      border: 'border-l-green-500',
      text: 'text-green-400',
    },
    error: {
      gradient: 'from-red-500/10 via-red-500/20 to-red-500/10',
      border: 'border-l-red-500',
      text: 'text-red-400',
    },
    warning: {
      gradient: 'from-yellow-500/10 via-yellow-500/20 to-yellow-500/10',
      border: 'border-l-yellow-500',
      text: 'text-yellow-400',
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      ref={ref}
      className={cn(
        "fixed backdrop-blur-sm rounded-lg border-l-4",
        "transform transition-all duration-500 ease-out",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[state=open]:slide-in-from-right-5 data-[state=closed]:slide-out-to-right-5",
        className,
        style.border,
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8 pointer-events-none"
      )}
      data-state={isVisible ? 'open' : 'closed'}
      {...props}
    >
      <div className="relative overflow-hidden p-4 pe-16">
        {/* Gradient Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r",
            style.gradient,
            "transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        ></div>
        {/* Content */}
        <div className={cn(
          "flex gap-4 items-start relative z-10",
          "transform transition-all duration-500",
          isVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-2 opacity-0"
        )}>
          <Icon className={cn(
            "w-4 h-4 mt-1",
            style.text,
            "transition-transform duration-500",
            isVisible ? "animate-pulse" : "scale-95"
          )} />
          <div className={cn(
            "transition-all duration-500",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          )}>
            <h3 className={cn(
              "text-sm font-medium mb-1",
              style.text,
              "transition-colors duration-500"
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-[10px] font-light text-gray-400",
              "transition-opacity duration-500",
              isVisible ? "opacity-90" : "opacity-0"
            )}>
              {body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
