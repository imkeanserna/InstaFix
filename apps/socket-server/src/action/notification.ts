import { BookingEventType } from '@prisma/client/edge';
import { prisma } from '../db/index';

// export const runtime = 'edge'

export async function addBookingNotification({
  bookingId,
  userId,
  type
}: {
  bookingId: string,
  userId: string,
  type: BookingEventType
}) {
  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      clientId: true,
      freelancerId: true,
      status: true
    }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  try {
    const notification = await prisma.bookingNotification.create({
      data: {
        userId: userId,
        type: type,
        bookingId: bookingId,
      },
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
            review: {
              select: {
                id: true
              }
            }
          }
        },
        createdAt: true
      }
    });

    const canReview: boolean = notification.booking.client.id === userId &&
      notification.booking.status === 'COMPLETED' &&
      notification.booking.review === null;

    return {
      ...notification,
      canReview
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
