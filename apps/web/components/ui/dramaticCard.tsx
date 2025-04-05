"use client";

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

const Effect3D = ({ urlImage }: {
  urlImage: string
}) => {
  const containerRef = useRef(null);
  const shineRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const container: any = containerRef.current;
    const shine: any = shineRef.current;
    if (!container || !shine) return;

    const w = container.scrollWidth;
    const h = container.scrollHeight;
    const limit = 10;
    const sensitivity = 200;

    const rect = container.getBoundingClientRect();
    const mouseX = Math.round(mousePosition.x - rect.left);
    const mouseY = Math.round(mousePosition.y - rect.top);

    const dx = mouseX - w / 2;
    const dy = mouseY - h / 2;

    let ax = dx / sensitivity;
    let ay = dy / sensitivity;

    ax = Math.max(Math.min(ax, limit), -limit);
    ay = Math.max(Math.min(ay, limit), -limit);

    const theta = Math.atan2(dy, dx);
    let angle = theta * 180 / Math.PI - 90;
    angle = angle < 0 ? angle + 360 : angle;
    angle = angle - 180;

    container.style.transform = `rotateX(${-ay}deg) rotateY(${ax}deg)`;

    const xPercentage = (mouseX / w) * 100;
    const yPercentage = (mouseY / h) * 100;
    shine.style.backgroundImage = `linear-gradient(${angle}deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 80%)`;
    shine.style.backgroundPosition = `${xPercentage}% ${yPercentage}%`;
  }, [mousePosition]);

  return (
    <div className="page-container w-full px-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-[1300px] aspect-[16/9] mx-auto overflow-hidden border-4 
        border-gray-800 rounded-xl shadow-xl transition-transform duration-100 ease-out effect3d__container"
      >
        <div
          ref={shineRef}
          className="absolute inset-0 z-10 pointer-events-none rounded-xl effect3d--shine"
        />
        <Image
          src={urlImage}
          alt="testimonial overall"
          fill
          quality={100}
          className="object-cover z-0 rounded-xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(-1px)',
          }}
        />
      </div>
    </div>
  );
};

export default Effect3D;
