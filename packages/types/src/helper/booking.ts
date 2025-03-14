import { BookingEventType, BookingStatus } from "@prisma/client/edge";

export function getStatusForEventType(eventType: BookingEventType): BookingStatus {
  const statusMap: Record<BookingEventType, BookingStatus> = {
    [BookingEventType.CANCELLED]: BookingStatus.CANCELLED,
    [BookingEventType.CONFIRMED]: BookingStatus.CONFIRMED,
    [BookingEventType.DECLINED]: BookingStatus.DECLINED,
    [BookingEventType.RESCHEDULED]: BookingStatus.PENDING,
    [BookingEventType.CREATED]: BookingStatus.PENDING,
    [BookingEventType.UPDATED]: BookingStatus.PENDING,
    [BookingEventType.COMPLETED]: BookingStatus.COMPLETED
  };

  const status = statusMap[eventType];
  if (!status) {
    throw new Error(`No status defined for event type: ${eventType}`);
  }

  return status;
}

export function getNotificationRecipient(eventType: BookingEventType, clientId: string, freelancerId: string): string {
  const recipientMap: Record<BookingEventType, string> = {
    [BookingEventType.RESCHEDULED]: freelancerId,
    [BookingEventType.CANCELLED]: freelancerId,
    [BookingEventType.CONFIRMED]: clientId,
    [BookingEventType.DECLINED]: clientId,
    [BookingEventType.CREATED]: freelancerId,
    [BookingEventType.UPDATED]: freelancerId,
    [BookingEventType.COMPLETED]: clientId
  };

  const recipientId = recipientMap[eventType];
  if (!recipientId) {
    throw new Error(`No notification recipient defined for event type: ${eventType}`);
  }

  return recipientId;
}

export function validateBookingCancellation({
  booking,
  userId,
  currentDate = new Date()
}: {
  booking: {
    id: string;
    clientId: string;
    date: Date | string;
    createdAt: Date | string;
  };
  userId: string;
  currentDate?: Date;
}): { canCancel: boolean; message?: string } {
  const isClientCancelling = booking.clientId === userId;

  if (!isClientCancelling) {
    return { canCancel: true };
  }

  const bookingDate = new Date(booking.date);
  const bookingCreatedAt = new Date(booking.createdAt);

  // Check if booking is for the same day
  const isSameDay = bookingDate.toDateString() === currentDate.toDateString();

  // Calculate time since booking was created (in minutes)
  const minutesSinceCreation = (currentDate.getTime() - bookingCreatedAt.getTime()) / (1000 * 60);

  // Calculate hours until appointment
  const hoursUntilAppointment = (bookingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

  // Grace period check: allow cancellation within 30 minutes of booking
  if (minutesSinceCreation <= 30) {
    return { canCancel: true };
  }

  if (isSameDay) {
    // For same-day bookings, require 2+ hours notice
    if (hoursUntilAppointment < 2) {
      return {
        canCancel: false,
        message: 'Cancellation failed: Same-day bookings can only be cancelled at least 2 hours before the scheduled time'
      };
    }
  } else {
    // For future bookings, require 24+ hours notice
    if (hoursUntilAppointment < 24) {
      return {
        canCancel: false,
        message: 'Cancellation failed: Bookings for future dates can only be cancelled at least 24 hours before the scheduled time'
      };
    }
  }

  // If all checks pass, allow cancellation
  return { canCancel: true };
}
