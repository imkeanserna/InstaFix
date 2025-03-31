import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { MessageType, TypeBookingNotification } from "@repo/types";
import { getBookingNotificationCount, getBookingNotifications } from "../_action/notification/booking";
import { z } from "zod";

export const runtime = 'edge';

const notificationQuerySchema = z.object({
  type: z.enum([MessageType.BOOKING, MessageType.CHAT]),
  cursor: z.string().nullable().optional().transform(value => value ?? undefined),
  take: z.coerce.number().min(1).max(100).default(10)
});

export async function GET(request: NextRequest) {
  try {
    const user: User | undefined = await currentUser();
    if (!user || !user?.id) {
      return errorResponse('User Id is required', undefined, 400);
    }

    const { searchParams } = new URL(request.url);
    const validatedQuery = notificationQuerySchema.safeParse({
      type: searchParams.get('type'),
      cursor: searchParams.get('cursor'),
      take: searchParams.get('take')
    });

    if (!validatedQuery.success) {
      return errorResponse(
        'Invalid query parameters',
        validatedQuery.error.message,
        400
      );
    }

    let notifications: TypeBookingNotification[] = [];
    let unreadCount = 0;
    let hasNextPage = false;
    let endCursor: string | undefined;

    switch (validatedQuery.data.type as MessageType) {
      case MessageType.BOOKING:
        const results = await getBookingNotifications({
          userId: user.id,
          cursor: validatedQuery.data.cursor,
          take: validatedQuery.data.take
        });
        hasNextPage = results.length > validatedQuery.data.take;
        notifications = hasNextPage ? results.slice(0, -1) : results;
        endCursor = hasNextPage ? notifications[notifications.length - 1].id : undefined;
        unreadCount = await getBookingNotificationCount({ userId: user.id });
        break;
      case MessageType.CHAT:
        break;
      default:
        return errorResponse('Type is required', undefined, 400);
    }

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          hasNextPage,
          endCursor,
          unreadCount
        }
      }
    });
  } catch (error) {
    console.error('Error in getting notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
