"use client";

import { WebSocketContext } from "@/context/WebSocketProvider";
import { useContext } from "react";

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
