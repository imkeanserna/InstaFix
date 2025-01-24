import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { getSearchSuggestions } from "../_action/posts/searchQuery";
import { SearchSuggestion } from '@repo/types';

export const runtime = "edge";

const searchQuerySchema = z.object({
  q: z.string().min(3).max(100),
  limit: z.number().min(1).max(50).optional().default(5)
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get('q');
    const limit = searchParams.get('limit');

    const validatedData = searchQuerySchema.parse({
      q: query,
      limit: limit ? parseInt(limit) : undefined
    });

    const suggestions: SearchSuggestion[] = await getSearchSuggestions(
      validatedData.q,
      validatedData.limit
    );

    return NextResponse.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    if (error instanceof z.ZodError) {
      return errorResponse('Invalid search parameters', error.errors[0].message);
    }
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
