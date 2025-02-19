import { BookingEventType } from '@prisma/client/edge';
import { prisma } from '../db/index';
import { TypeBookingNotification } from '@repo/types';

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
    const notification: TypeBookingNotification = await prisma.bookingNotification.create({
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
            description: true,
            status: true,
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
      }
    });

    return notification;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
