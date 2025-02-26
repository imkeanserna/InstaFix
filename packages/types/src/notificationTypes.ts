import { Prisma } from "@prisma/client/edge";
import { CursorPagination } from "./postTypes";

const bookingNotificationSelect = {
  id: true,
  type: true,
  isRead: true,
  booking: {
    select: {
      id: true,
      date: true,
      description: true,
      status: true,
      freelancer: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      client: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      post: {
        select: {
          id: true,
          title: true
        }
      }
    }
  },
  createdAt: true
} as const;

export type TypeBookingNotification = Prisma.BookingNotificationGetPayload<{
  select: typeof bookingNotificationSelect
}> & { canReview: boolean };

const bookingNotificationById = {
  id: true,
  type: true,
  isRead: true,
  booking: {
    select: {
      id: true,
      date: true,
      status: true,
      description: true,
      totalAmount: true,
      quantity: true,
      post: {
        select: {
          id: true,
          title: true,
          pricingType: true,
          hourlyRate: true,
          fixedPrice: true,
          customDetails: true,
          packageDetails: true,
          coverPhoto: true,
          reviews: {
            select: { id: true }
          },
          averageRating: true,
          location: {
            select: {
              id: true,
              fullAddress: true
            }
          }
        }
      },
      freelancer: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      client: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      createdAt: true
    }
  },
  createdAt: true
} as const;

export type TypeBookingNotificationById = Prisma.BookingNotificationGetPayload<{
  select: typeof bookingNotificationById
}> & { canReview: boolean };

export type NotificationCursorPagination = CursorPagination & {
  unreadCount: number;
}

export type NoficationsResponseWithCursor = {
  notifications: TypeBookingNotification[];
  pagination: NotificationCursorPagination;
};

export type NotificationState = {
  count: number;
  lastReadTimestamp: number;
  notifications: TypeBookingNotification[];
  pagination: NotificationCursorPagination;
};
