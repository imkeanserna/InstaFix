import { prisma } from '@/server/index';
import { TypeBookingNotification, TypeBookingNotificationById } from "@repo/types";

// export const runtime = 'edge'

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

    const notifications: TypeBookingNotification[] = await prisma.bookingNotification.findMany({
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
            }
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return notifications
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
  bookingId
}: {
  userId: string,
  bookingId: string
}): Promise<TypeBookingNotificationById | null> {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    if (!bookingId) {
      throw new Error('Booking Id is required');
    }

    const notification: TypeBookingNotificationById | null = await prisma.bookingNotification.findUnique({
      where: {
        id: bookingId,
        userId: userId
      }, select: {
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
      }
    });

    return notification;
  } catch (error) {
    throw error
  }
}
