import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { MessageType, TypeBookingNotificationById } from "@repo/types";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBookingNotificationsById, updateBookingNotification } from "../../_action/notification/booking";
import { prisma } from "@/server";

export const runtime = 'edge';

const notificationQuerySchema = z.object({
  type: z.enum([MessageType.BOOKING, MessageType.CHAT])
});

export async function GET(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    const user: User | undefined = await currentUser();
    if (!user || !user?.id) {
      return errorResponse('User Id is required', undefined, 400);
    }

    const notificationId = params?.notificationId;
    if (!notificationId) {
      return errorResponse('Notification Id is required', undefined, 400);
    }

    const { searchParams } = new URL(request.url);
    const validatedQuery = notificationQuerySchema.safeParse({
      type: searchParams.get('type'),
    });

    if (!validatedQuery.success) {
      return errorResponse(
        'Invalid query parameters',
        validatedQuery.error.message,
        400
      );
    }

    let notification: TypeBookingNotificationById | null = null;

    switch (validatedQuery.data.type as MessageType) {
      case MessageType.BOOKING:
        notification = await prisma.$transaction(async (tx) => {
          const notif: TypeBookingNotificationById | null = await getBookingNotificationsById({
            userId: user?.id as string,
            bookingId: notificationId,
            prisma: tx
          });

          if (notif && !notif.isRead) {
            await updateBookingNotification({
              userId: user?.id as string,
              bookingId: notificationId,
              data: {
                isRead: true
              },
              prisma: tx
            })
          }
          return notif;
        })
        break;
      case MessageType.CHAT:
        break;
      default:
        return errorResponse('Type is required', undefined, 400);
    }

    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error in getting notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
