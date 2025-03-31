import { prisma, PrismaClientOrTx } from '@/server/index';
import { BookingNotification } from '@prisma/client/edge';
import { TypeBookingNotification, TypeBookingNotificationById } from "@repo/types";
import { canReviewNotification, sortNotificationsByPriority } from '../helper/bookingUtils';

export const runtime = 'edge'

export async function getBookingNotifications({
  userId,
  cursor,
  take
}: {
  userId: string;
  cursor: string | undefined;
  take: number
}): Promise<TypeBookingNotification[]> {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    const notifications = await prisma.bookingNotification.findMany({
      take: take + 1,
      where: {
        userId: userId
      },
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1
      }),
      select: {
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
            },
            review: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const notificationsWithReviewStatus: TypeBookingNotification[] = notifications.map(notification => {
      const canReview = canReviewNotification({
        clientId: notification.booking.client.id,
        userId,
        status: notification.booking.status,
        reviewId: notification.booking.review?.id
      });

      return {
        ...notification,
        canReview
      };
    });

    return sortNotificationsByPriority(notificationsWithReviewStatus);
  } catch (error) {
    throw error
  }
}

export async function getBookingNotificationCount({
  userId
}: {
  userId: string
}): Promise<number> {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    return await prisma.bookingNotification.count({
      where: {
        userId: userId,
        isRead: false
      }
    })
  } catch (error) {
    throw error
  }
}

export async function getBookingNotificationsById({
  userId,
  bookingId,
  prisma: tx = prisma
}: {
  userId: string,
  bookingId: string,
  prisma?: PrismaClientOrTx
}): Promise<TypeBookingNotificationById | null> {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    if (!bookingId) {
      throw new Error('Booking Id is required');
    }

    const notification = await tx.bookingNotification.findUnique({
      where: {
        id: bookingId,
        userId: userId
      },
      select: {
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
                tags: {
                  select: {
                    subcategory: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                },
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
            review: {
              select: {
                id: true
              }
            },
            createdAt: true
          }
        },
        createdAt: true
      }
    });

    if (!notification) {
      return null;
    }

    const canReview = canReviewNotification({
      clientId: notification.booking.client.id,
      userId,
      status: notification.booking.status,
      reviewId: notification.booking.review?.id
    });

    return {
      ...notification,
      canReview
    };
  } catch (error) {
    throw error
  }
}

type UpdateBookingNotificationData = Partial<
  Pick<BookingNotification, 'isRead' | 'type'>
>;

export async function updateBookingNotification({
  userId,
  bookingId,
  data,
  prisma: tx = prisma
}: {
  userId: string,
  bookingId: string,
  data: UpdateBookingNotificationData,
  prisma?: PrismaClientOrTx
}) {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    if (!bookingId) {
      throw new Error('Booking Id is required');
    }

    const updateNotification: BookingNotification = await tx.bookingNotification.update({
      where: {
        id: bookingId,
        userId: userId
      },
      data: {
        ...data
      }
    });

    return updateNotification;
  } catch (error) {
    throw error
  }
}
