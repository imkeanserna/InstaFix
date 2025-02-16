import { NotificationType } from '@prisma/client/edge';
import { prisma } from '../db/index';

// export const runtime = 'edge'
//
// user
// post title
// booking description
// booking status
// notification created
//
// -- notification page
// notification id

export async function addBookingNotification({
  bookingId
}: {
  bookingId: string,
}) {
  try {
    // validate the parameters

    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.BOOKING,
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
            freelancer: {
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
