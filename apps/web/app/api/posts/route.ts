import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "../_action/posts/getPosts";
import { parseAndValidateTake, parseLocationParams, parsePriceParams, parseServicesIncluded, validateEnumParam, validateNumericParam } from "../_action/helper/postUtils";
import { EngagementType, TargetAudience } from "@prisma/client/edge";
import { trackPopularSearch } from "../_action/posts/searchQuery";
import { CursorPaginationOptions, ResponseDataWithCursor, ResponseDataWithLocationAndCursor } from "@repo/types";
import { sanitizeSearchQuery } from "../_action/helper/searchUtil";

// export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const cursor = request.nextUrl.searchParams.get('cursor');
    const take = parseAndValidateTake(request.nextUrl.searchParams.get('take') ?? '10');
    const categoryIds = request.nextUrl.searchParams.get('categories')?.split(',').filter(Boolean);
    const subcategoryIds = request.nextUrl.searchParams.get('subcategories')?.split(',').filter(Boolean);
    const searchQuery = sanitizeSearchQuery(request.nextUrl.searchParams.get('search') ?? '');

    if (subcategoryIds && subcategoryIds.length > 0) {
      if (!categoryIds || categoryIds.length === 0) {
        return errorResponse(
          'Category is required when filtering by subcategories',
          undefined,
          400
        );
      }
    }

    if (searchQuery.length > 0 && searchQuery.length < 3) {
      return errorResponse('Search query must be at least 3 characters', undefined, 400);
    }

    const completeSearch = request.nextUrl.searchParams.get('complete') === 'true';
    const location = parseLocationParams(request);
    const price = parsePriceParams(request);

    const engagementType = validateEnumParam(
      request.nextUrl.searchParams.get('engagementType'),
      EngagementType
    ) as EngagementType | null;

    const minRating = validateNumericParam(request.nextUrl.searchParams.get('minRating'), 0);

    const targetAudience = validateEnumParam(
      request.nextUrl.searchParams.get('targetAudience'),
      TargetAudience
    ) as TargetAudience | null;

    const servicesIncluded = parseServicesIncluded(request.nextUrl.searchParams.get('services'));

    const filterOptions: CursorPaginationOptions = {
      ...(take && { take }),
      ...(cursor && { cursor }),
      ...(searchQuery && { searchQuery }),
      ...(location && { location }),
      ...(price && { price }),
      ...(engagementType && { engagementType }),
      ...(minRating > 0 && { minRating }),
      ...(targetAudience && { targetAudience }),
      ...(servicesIncluded?.length && { servicesIncluded }),
      ...(categoryIds && { categoryIds }),
      ...(subcategoryIds && { subcategoryIds })
    };

    const result: ResponseDataWithLocationAndCursor | ResponseDataWithCursor = await getPosts(filterOptions);

    // For storing popular search
    if (completeSearch && searchQuery.trim()) {
      await trackPopularSearch(searchQuery);
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
