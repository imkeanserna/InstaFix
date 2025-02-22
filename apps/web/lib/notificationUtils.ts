import { MessageType, NoficationsResponseWithCursor, TypeBookingNotificationById } from "@repo/types";

export type GetNotificationsResponse = {
  success: boolean;
  data: NoficationsResponseWithCursor;
  error?: string;
}

export async function getNotifications({
  type,
  cursor,
  take
}: {
  type: MessageType;
  cursor?: string | null;
  take: number;
}) {
  const queryParams = new URLSearchParams();
  queryParams.append("type", type);
  queryParams.append("take", String(take));

  if (cursor) {
    queryParams.append("cursor", cursor);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/notifications?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetNotificationsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch notifications');
    }

    return {
      data: result.data,
      nextCursor: result.data.notifications.length > 0 ? result.data.pagination?.endCursor : undefined
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      data: {
        notifications: [],
        pagination: {
          hasNextPage: false,
          unreadCount: 0
        }
      },
      nextCursor: undefined
    };
  }
}

type GetNotificationResponse = {
  success: boolean;
  data: TypeBookingNotificationById | null;
  error?: string;
}

export async function getNotification({
  type,
  notificationId
}: {
  type: MessageType,
  notificationId: string
}) {
  const queryParams = new URLSearchParams();
  queryParams.append("type", type);

  try {
    if (!notificationId) {
      throw new Error('notification id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/notifications/${notificationId}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetNotificationResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch notification');
    }

    return result.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const capitalizeFirstLetter = (name: string) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};
