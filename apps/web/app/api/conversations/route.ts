import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getConversations } from "../_action/conversations/conversations";
import { GetConversationsResult } from "@repo/types";

// export const runtime = 'edge'

const conversationQuerySchema = z.object({
  cursor: z.string().nullable().optional().transform(value => value ?? undefined),
  take: z.coerce.number().min(5).max(50).default(15)
});

export async function GET(request: NextRequest) {
  try {
    const user: User | undefined = await currentUser();
    if (!user || !user?.id) {
      return errorResponse('User Id is required', undefined, 400);
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

    const { conversations, pagination }: GetConversationsResult = await getConversations({
      userId: user.id,
      cursor: validatedQuery.data.cursor,
      take: validatedQuery.data.take
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        pagination
      }
    })
  } catch (error) {
    console.error('Error in getting conversation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
