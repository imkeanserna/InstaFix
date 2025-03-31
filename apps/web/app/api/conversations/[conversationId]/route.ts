import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMessages } from "../../_action/conversations/messages";
import { GetMessagesResult } from "@repo/types";

export const runtime = 'edge'

const conversationQuerySchema = z.object({
  cursor: z.string().nullable().optional().transform(value => value ?? undefined),
  take: z.coerce.number().min(5).max(100).default(20)
});

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user: User | undefined = await currentUser();
    if (!user || !user?.id) {
      return errorResponse('User Id is required', undefined, 400);
    }

    const conversationId = params?.conversationId;
    if (!conversationId) {
      return errorResponse('Conversation Id is required', undefined, 400);
    }

    const { searchParams } = new URL(request.url);
    const validatedQuery = conversationQuerySchema.safeParse({
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

    const { messages, pagination, participants, unreadCount }: GetMessagesResult = await getMessages({
      conversationId,
      userId: user.id,
      cursor: validatedQuery.data.cursor,
      take: validatedQuery.data.take
    });

    return NextResponse.json({
      success: true,
      data: {
        messages,
        participants,
        unreadCount,
        pagination
      }
    })
  } catch (error) {
    console.error('Error in getting messages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
