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

    // Remove the shine effect entirely
    shine.style.backgroundImage = 'none';
  }, [mousePosition]);

  return (
    <div className="page-container">
      <div
        ref={containerRef}
        className="effect3d__container moveable-3d relative h-[80vh] w-[1200px] 
            overflow-hidden z-10 rounded-xl border-[6px] border-gray-800"
      >
        <div
          ref={shineRef}
          className="effect3d--shine absolute top-0 left-0 right-0 bottom-0 z-10"
        />
        <Image
          src={urlImage}
          alt="testimonial overall"
          fill
          quality={100}
          className="absolute h-full w-full object-cover z-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(-1px)'
          }}
        />
      </div>
    </div>
  );
};

export default Effect3D;
