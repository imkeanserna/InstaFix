"use client";

import { BookingActionData, useBookingAction, useBookingActions, useBookingMessage } from "../useBooking";
import { useWebSocket } from "../useWebSocket";
import { MessageType, NotificationType, TypeBookingNotification, TypeBookingNotificationById } from "@repo/types";
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

  const handleDecline = async ({ actionData, e }: { actionData: BookingActionData, e: React.MouseEvent }) => {
    e.stopPropagation();
    setIsDeclineLoading(true);
    try {
      await handleBookingAction(MessageType.BOOKING, BookingEventType.DECLINED, actionData);
      setBookingStatus(BookingStatus.DECLINED);
    } catch (error) {
      toast.error('Error declining booking');
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
      toast.error('Error accepting booking');
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
