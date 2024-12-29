"use client";

import React from 'react';

interface BlueLoaderProps {
  size?: number;
  className?: string;
}

export const BlueLoader: React.FC<BlueLoaderProps> = ({ size = 300, className = "" }) => {
  // Calculate relative sizes based on the provided size
  const orbitalSize = size / 2;
  const nucleusSize = size / 10;
  // Calculate border sizes relative to overall size
  const orbitalBorderSize = Math.max(1, size / 75); // Minimum 1px border
  const concentricBorderSize = Math.max(1, size / 150); // Minimum 1px border

  return (
    <div className={`inline-block ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Orbital Section */}
        <div
          className="absolute rounded-full perspective-[1200px] z-10 animate-pulse"
          style={{
            width: orbitalSize,
            height: orbitalSize,
            top: `calc(50% - ${orbitalSize / 2}px)`,
            left: `calc(50% - ${orbitalSize / 2}px)`
          }}
        >
          {/* Inner Orbital Rings */}
          <div
            className="absolute box-border w-full h-full rounded-full rotate-one"
            style={{
              borderBottom: `${orbitalBorderSize}px solid #ffffff`,
            }}
          />
          <div
            className="absolute box-border w-full h-full rounded-full rotate-two"
            style={{
              borderRight: `${orbitalBorderSize}px solid #e6f3ff`,
            }}
          />
          <div
            className="absolute box-border w-full h-full rounded-full rotate-three"
            style={{
              borderTop: `${orbitalBorderSize}px solid #cce7ff`,
            }}
          />

          {/* Nucleus */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: nucleusSize,
              height: nucleusSize,
              top: `calc(50% - ${nucleusSize / 2}px)`,
              left: `calc(50% - ${nucleusSize / 2}px)`,
              boxShadow: `0 0 ${size / 15}px rgba(255, 255, 255, 0.8)`
            }}
          />
        </div>

        {/* Concentric Circles */}
        <div className="absolute animate-pulse" style={{ width: size, height: size }}>
          {[...Array(7)].map((_, index) => {
            const circleSize = (size / 15) + (index * (size / 15));
            const duration = 3 - (index * 0.2);
            // Blue gradient colors from light to darker
            const colors = [
              '#ffffff',
              '#e6f3ff',
              '#cce7ff',
              '#99cbff',
              '#66afff',
              '#3393ff',
              '#0077ff'
            ];

            return (
              <div
                key={index}
                className="absolute box-border rounded-full border-transparent"
                style={{
                  top: `${circleSize / 2}px`,
                  left: `${circleSize / 2}px`,
                  right: `${circleSize / 2}px`,
                  bottom: `${circleSize / 2}px`,
                  borderTop: `${concentricBorderSize}px solid ${colors[index]}`,
                  animation: `spin ${duration}s linear infinite`
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
