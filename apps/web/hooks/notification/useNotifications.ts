"use client";

import { getFormattedTime, getTimeAgo } from "@/lib/dateFormatters";
import { getNotifications } from "@/lib/notificationUtils";
import { BookingEventType, BookingStatus } from "@prisma/client/edge";
import { getStatusForEventType, MessageType, NotificationState, TypeBookingNotification } from "@repo/types";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { BookingActionData, useBookingAction, useBookingActions } from "../useBooking";
import { useWebSocket } from "../useWebSocket";
import { toast } from "@repo/ui/components/ui/sonner";

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationState, setNotificationState] = useState<NotificationState>({
    count: 0,
    lastReadTimestamp: Date.now(),
    notifications: [],
    pagination: {
      hasNextPage: false,
      endCursor: undefined,
      unreadCount: 0
    }
  });

  useEffect(() => {
    fetchNotifications(MessageType.BOOKING);
  }, []);

  const fetchNotifications = async (type: MessageType) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getNotifications({
        type,
        take: 10
      });

      setNotificationState(prev => ({
        ...prev,
        notifications: result.data.notifications,
        pagination: result.data.pagination
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async (type: MessageType) => {
    if (!notificationState.pagination.hasNextPage || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await getNotifications({
        type,
        cursor: notificationState.pagination.endCursor,
        take: 10
      });

      setNotificationState(prev => ({
        ...prev,
        notifications: [...prev.notifications, ...result.data.notifications],
        pagination: {
          ...result.data.pagination,
          unreadCount: prev.pagination.unreadCount
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = (data: TypeBookingNotification) => {
    setNotificationState(prev => ({
      ...prev,
      count: prev.count + 1,
      pagination: {
        ...prev.pagination,
        unreadCount: prev.pagination.unreadCount + 1
      },
      notifications: [data, ...prev.notifications]
    }));
  };

  const markAllAsRead = () => {
    setNotificationState(prev => ({
      ...prev,
      count: 0,
      lastReadTimestamp: Date.now(),
      pagination: {
        ...prev.pagination,
        unreadCount: 0
      },
      notifications: prev.notifications.map(notif => ({ ...notif, isRead: true }))
    }));
  };

  const clearNotifications = () => {
    setNotificationState({
      count: 0,
      lastReadTimestamp: Date.now(),
      notifications: [],
      pagination: {
        hasNextPage: false,
        endCursor: undefined,
        unreadCount: 0
      }
    });
  };

  const refresh = () => {
    fetchNotifications(MessageType.BOOKING);
  };

  return {
    notificationState,
    isLoading,
    error,
    addNotification,
    markAllAsRead,
    clearNotifications,
    loadMore,
    refresh,
    hasMore: notificationState.pagination.hasNextPage
  };
}

export const useNotificationCard = (notification: TypeBookingNotification, user: User) => {
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(notification.booking.status);
  const formattedDate = new Date(notification.booking.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const { sendMessage } = useWebSocket();
  const { handleBookingAction } = useBookingAction(sendMessage);
  const {
    isActionLoading,
    setIsActionLoading,
    resetLoadingStates
  } = useBookingActions();

  const isFreelancer = user.id === notification.booking.freelancer.id;
  const isClient = user.id === notification.booking.client.id;
  const exactTime = getFormattedTime(new Date(notification.createdAt));
  const timeAgo = getTimeAgo(new Date(notification.createdAt));

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
    bookingStatus,
    setBookingStatus,
    formattedDate,
    isFreelancer,
    isActionLoading,
    handleAction,
    isClient,
    exactTime,
    timeAgo
  };
};
