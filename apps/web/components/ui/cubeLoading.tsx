"use client";

import { useEffect, useState } from "react";

export function CubeLoader({ messages }: { messages: string[] }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-black/80 backdrop-blur-sm fixed">
      <div className="boxes">
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className="absolute top-[calc(50%+170px)] text-center text-xs text-gray-400 animate-pulse">
        {messages[currentMessageIndex]}
      </div>
    </div>
  );
};
