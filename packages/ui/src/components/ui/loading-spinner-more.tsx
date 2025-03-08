"use client";

export const LoadingSpinnerMore = ({ className = "w-4 h-4" }: { className?: string }) => (
  <div className={`animate-spin rounded-full border-2 border-yellow-500 border-t-transparent ${className}`} />
);
