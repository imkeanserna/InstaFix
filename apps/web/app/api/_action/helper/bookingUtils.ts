import { BookingStatus } from "@prisma/client/edge";
import { TypeBookingNotification } from "@repo/types";

export function sortNotificationsByPriority(notifications: TypeBookingNotification[]): TypeBookingNotification[] {
  // "New" means - notifications less than 3 days old
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  return notifications.sort((a, b) => {
    const priorityA = getPriorityScore(a, threeDaysAgo);
    const priorityB = getPriorityScore(b, threeDaysAgo);

    // Sort by priority first
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority, sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getPriorityScore(notification: TypeBookingNotification, threeDaysAgo: Date): number {
  const status = notification.booking.status;
  const createdAt = new Date(notification.createdAt);
  const priorities = {
    NEW_PENDING: 0,   // Pending and new (less than 3 days old)
    CONFIRMED: 1,     // Confirmed
    COMPLETED: 2,     // Completed
    OLD_PENDING: 3,   // Pending but old (more than 3 days old)
    CANCELLED: 4,     // Cancelled
    DECLINED: 5,      // Declined
    OTHER: 6          // Any other status (fallback)
  };

  if (status === 'PENDING' && createdAt >= threeDaysAgo) {
    return priorities.NEW_PENDING;
  } else if (status === 'CONFIRMED') {
    return priorities.CONFIRMED;
  } else if (status === 'COMPLETED') {
    return priorities.COMPLETED;
  } else if (status === 'PENDING' && createdAt < threeDaysAgo) {
    return priorities.OLD_PENDING;
  } else if (status === 'CANCELLED') {
    return priorities.CANCELLED;
  } else if (status === 'DECLINED') {
    return priorities.DECLINED;
  } else {
    return priorities.OTHER;
  }
}

export function canReviewNotification({
  clientId,
  userId,
  status,
  reviewId
}: {
  clientId: string,
  userId: string,
  status: string,
  reviewId: string | undefined
}): boolean {
  return clientId === userId && status === BookingStatus.COMPLETED && reviewId === undefined;
}
