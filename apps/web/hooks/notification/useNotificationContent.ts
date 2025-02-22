"use client";

import { BookingActionData, useBookingAction, useBookingActions, useBookingMessage } from "../useBooking";
import { useWebSocket } from "../useWebSocket";
import { MessageType, NotificationType, TypeBookingNotification, TypeBookingNotificationById } from "@repo/types";
import { useNotifications } from "./useNotifications";
import { BookingEventType, BookingStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { getNotification } from "@/lib/notificationUtils";

export const useNotificationContent = (notificationId: string) => {
  const [notification, setNotification] = useState<TypeBookingNotificationById | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { sendMessage, lastMessage, clearMessage } = useWebSocket();
  const { handleBookingAction } = useBookingAction(sendMessage);
  const { addNotification } = useNotifications();
  const {
    isDeclineLoading,
    isAcceptLoading,
    setIsDeclineLoading,
    setIsAcceptLoading,
    resetLoadingStates
  } = useBookingActions();

  // Fetch notification data
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
        console.error('Error fetching notification:', err);
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
      console.error('WebSocket error:', error);
      clearMessage();
    }
  });

  const handleDecline = async ({ actionData, e }: { actionData: BookingActionData, e: React.MouseEvent }) => {
    e.stopPropagation();
    setIsDeclineLoading(true);
    try {
      await handleBookingAction(MessageType.BOOKING, BookingEventType.DECLINED, actionData);
      setBookingStatus(BookingStatus.DECLINED);
    } catch (error) {
      console.error('Error declining booking:', error);
      resetLoadingStates();
    }
  };

  const handleAccept = async ({ actionData, e }: { actionData: BookingActionData, e: React.MouseEvent }) => {
    e.stopPropagation();
    setIsAcceptLoading(true);
    try {
      await handleBookingAction(MessageType.BOOKING, BookingEventType.CONFIRMED, actionData);
      setBookingStatus(BookingStatus.CONFIRMED);
    } catch (error) {
      console.error('Error accepting booking:', error);
      resetLoadingStates();
    }
  };

  return {
    notification,
    bookingStatus,
    isLoading,
    error,
    isDeclineLoading,
    isAcceptLoading,
    handleDecline,
    handleAccept
  };
}
