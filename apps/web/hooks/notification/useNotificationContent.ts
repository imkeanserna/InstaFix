"use client";

import { BookingActionData, useBookingAction, useBookingActions, useBookingMessage } from "../useBooking";
import { useWebSocket } from "../useWebSocket";
import { getStatusForEventType, MessageType, NotificationType, TypeBookingNotification, TypeBookingNotificationById } from "@repo/types";
import { useNotifications } from "./useNotifications";
import { BookingEventType, BookingStatus } from "@prisma/client/edge";
import { useEffect, useState } from "react";
import { getNotification } from "@/lib/notificationUtils";
import { toast } from "@repo/ui/components/ui/sonner";

export const useNotificationContent = (notificationId: string) => {
  const [notification, setNotification] = useState<TypeBookingNotificationById | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { sendMessage, lastMessage, clearMessage } = useWebSocket();
  const { handleBookingAction } = useBookingAction(sendMessage);
  const { addNotification } = useNotifications();
  const {
    isActionLoading,
    setIsActionLoading,
    resetLoadingStates
  } = useBookingActions();

  useEffect(() => {
    const fetchNotification = async () => {
      if (!notificationId) return;

      try {
        setIsLoading(true);
        const data: TypeBookingNotificationById | null = await getNotification({ notificationId, type: MessageType.BOOKING });

        if (data) {
          setNotification(data);
          setBookingStatus(data.booking.status);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notification'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotification();
  }, [notificationId]);

  useBookingMessage({
    lastMessage,
    onBookingCreated: () => {
      if (lastMessage?.type === MessageType.NOTIFICATION && lastMessage?.action === NotificationType.BOOKING) {
        addNotification(lastMessage?.payload as TypeBookingNotification);
      }
      clearMessage();
    },
    onError: (error) => {
      clearMessage();
    }
  });

  const handleAction = async ({
    actionData,
    bookingEventType,
    e
  }: {
    actionData: BookingActionData,
    bookingEventType: Exclude<BookingEventType, "CREATED">,
    e: React.MouseEvent
  }) => {
    e.stopPropagation();
    setIsActionLoading(true);
    try {
      handleBookingAction(MessageType.BOOKING, bookingEventType, actionData);
      setBookingStatus(getStatusForEventType(bookingEventType));
    } catch (error) {
      toast.error('Error action booking');
      resetLoadingStates();
    }
  };

  return {
    notification,
    bookingStatus,
    isLoading,
    error,
    isActionLoading,
    handleAction
  };
}
