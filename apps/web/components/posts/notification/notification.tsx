"use client";

import { useNotifications } from "@/hooks/notification/useNotifications";
import { useBookingMessage } from "@/hooks/useBooking";
import { useWebSocket } from "@/hooks/useWebSocket";
import { TypeBookingNotification } from "@repo/types";
import { useRouter } from "next/navigation";
import { NotificationIcon } from "../notificationBell";

export function NotificationBell() {
  const { notificationState, addNotification, } = useNotifications();
  const { lastMessage, clearMessage } = useWebSocket();
  const router = useRouter();

  useBookingMessage({
    lastMessage,
    onBookingCreated: () => {
      addNotification(lastMessage?.payload as TypeBookingNotification);
      clearMessage();
    },
    onError: (errorPayload) => {
      clearMessage();
    }
  });

  return (
    <NotificationIcon
      unreadCount={notificationState.pagination.unreadCount}
      onClick={() => router.push('/notifications')}
    />
  );
}
