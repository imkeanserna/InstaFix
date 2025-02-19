"use client";

import { getToken } from "@/lib/sessionUtils";
import { BookingEventType } from "@prisma/client/edge";
import { MessageType, NotificationType } from "@repo/types";
import { useSession } from "next-auth/react";
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

const WS_TOKEN_KEY = 'ws_token';

export interface WebSocketMessage<T = any> {
  type: MessageType;
  action: BookingEventType | NotificationType;
  payload: T;
}

export interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (event: MessageType, data?: any) => void;
  lastMessage: WebSocketMessage | null;
  clearMessage: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const clearMessage = useCallback(() => {
    setLastMessage(null);
  }, []);

  // Function to get token from localStorage or fetch new one
  const getWebSocketToken = async () => {
    const storedToken = localStorage.getItem(WS_TOKEN_KEY);

    if (storedToken) {
      return storedToken;
    }

    // Fetch new token if none exists or current one is expired
    try {
      const response: string = await getToken();
      localStorage.setItem(WS_TOKEN_KEY, response);
      return response;
    } catch (error) {
      console.error('Error fetching token:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!session?.user || !session?.user?.id) return;

    // Initialize WebSocket connection
    const connectWebSocket = async () => {
      const token = await getWebSocketToken();
      if (!token) {
        console.error('Failed to get WebSocket token');
        return;
      }

      const ws = new WebSocket(`${process.env.SOCKET_SERVER_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setLastMessage(message);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after delay
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearMessage();
    };
  }, [session, clearMessage]);

  const sendMessage = (event: MessageType, data?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload: { event: MessageType, data?: any } = {
        event: event,
      }

      if (data) {
        payload.data = data
      }

      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.error('WebSocket not connected');
    }
  };

  const value = {
    isConnected,
    sendMessage,
    lastMessage,
    clearMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const clearWebSocketToken = () => {
  localStorage.removeItem(WS_TOKEN_KEY);
};
