"use client";

import { useNotifications } from "@/hooks/notification/useNotifications";
import { useBookingMessage } from "@/hooks/useBooking";
import { useWebSocket } from "@/hooks/useWebSocket";
import { TypeBookingNotification } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotificationBell() {
  const { addNotification } = useNotifications();
  const { lastMessage, clearMessage } = useWebSocket();
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useBookingMessage({
    lastMessage,
    onBookingCreated: () => {
      setNotificationCount(notificationCount + 1);
      addNotification(lastMessage?.payload as TypeBookingNotification);
      clearMessage();
    },
    onError: (errorPayload) => {
      clearMessage();
    }
  });

  return (
    <Button
      onClick={() => {
        router.push("/notifications");
      }}
    >
      <Bell className="h-5 w-5" />
      {notificationCount}
    </Button>
  );
}
