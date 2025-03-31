import { User } from "next-auth";
import { currentUser } from "@/lib";
import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFavorites } from "../_action/favorites/favorites";
import { FavoritesResponseWithCursor } from "@repo/types";

export const runtime = 'edge';

const favoritesQuerySchema = z.object({
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
    const validatedQuery = favoritesQuerySchema.safeParse({
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

    const { cursor, take } = validatedQuery.data;
    const { favorites, pagination, totalCount }: FavoritesResponseWithCursor = await getFavorites({
      userId: user.id,
      cursor,
      take
    });

    return NextResponse.json({
      success: true,
      data: {
        favorites,
        pagination,
        totalCount
      }
    });
  } catch (error) {
    console.error('Error in getting favorites:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
