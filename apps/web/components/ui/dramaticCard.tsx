"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Play } from "lucide-react";

interface Effect3DProps {
  urlImage: string;
  videoUrl: string;
}

const Effect3D = ({ urlImage, videoUrl }: Effect3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const shine = shineRef.current;
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
    let angle = (theta * 180) / Math.PI - 90;
    angle = angle < 0 ? angle + 360 : angle;
    angle = angle - 180;

    container.style.transform = `rotateX(${-ay}deg) rotateY(${ax}deg)`;

    const xPercentage = (mouseX / w) * 100;
    const yPercentage = (mouseY / h) * 100;
    shine.style.backgroundImage = `linear-gradient(${angle}deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 80%)`;
    shine.style.backgroundPosition = `${xPercentage}% ${yPercentage}%`;
  }, [mousePosition]);

  const content = (
    <div
      ref={containerRef}
      className="relative w-full max-w-[1300px] aspect-[16/9] mx-auto overflow-hidden border-4 
        border-gray-800 rounded-xl shadow-xl transition-transform duration-100 ease-out effect3d__container group"
    >
      <div
        ref={shineRef}
        className="absolute inset-0 z-10 pointer-events-none rounded-xl effect3d--shine"
      />
      <Image
        src={urlImage}
        alt="3D effect image"
        fill
        quality={100}
        className="object-cover z-0 rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{
          transformStyle: "preserve-3d",
          transform: "translateZ(-1px)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/10 transition-colors duration-300 z-20" />

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center active:scale-[.97] z-30">
        <div className="relative group/play">
          <Play className="w-16 h-16 md:w-20 md:h-20 text-white fill-white drop-shadow-2xl group-hover:scale-110 transition-all duration-500 cursor-pointer" />
          {/* Gradient overlay on hover */}
          <Play
            className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 opacity-0 group-hover/play:opacity-100 transition-all duration-500 cursor-pointer bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent fill-current"
            style={{
              background: "linear-gradient(135deg, #fde047, #facc15, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          />
          {/* Glow effect on hover */}
          <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full opacity-20 group-hover:opacity-40 transition-all duration-500 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 blur-lg z-10 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild className="page-container w-full px-4">
        <div className="cursor-pointer">{content}</div>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] p-0 bg-black border-0 overflow-hidden !rounded-2xl">
        <div className="relative w-full h-full">
          <div
            className="relative h-0"
            style={{ paddingBottom: "54.890678941311855%" }}
          >
            <iframe
              src={`${videoUrl}&autoplay=1&hideEmbedTopBar=1&speed=true&playbackspeed=1`}
              className="absolute top-0 left-0 w-full h-full border-0"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Effect3D;
