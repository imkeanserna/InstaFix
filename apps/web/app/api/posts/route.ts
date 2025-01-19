import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "../_action/posts/getPosts";
import { parseAndValidateTake, parseLocationParams, parsePriceParams, parseServicesIncluded, validateNumericParam } from "../_action/helper/postUtils";
import { EngagementType, TargetAudience } from "@prisma/client/edge";
import { trackPopularSearch } from "../_action/posts/searchQuery";
import { CursorPaginationOptions, ResponseDataWithCursor, ResponseDataWithLocationAndCursor } from "@repo/types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const cursor = request.nextUrl.searchParams.get('cursor');
    const take = parseAndValidateTake(request.nextUrl.searchParams.get('take') ?? '10');
    const categoryId = request.nextUrl.searchParams.get('category');
    const subcategoryId = request.nextUrl.searchParams.get('subcategory');

    if (subcategoryId && !categoryId) {
      return errorResponse('Category is required when filtering by subcategory', undefined, 400);
    }

    const searchQuery = request.nextUrl.searchParams.get('search') ?? '';
    const completeSearch = request.nextUrl.searchParams.get('complete') === 'true';
    const location = parseLocationParams(request);
    const price = parsePriceParams(request);
    const engagementType = request.nextUrl.searchParams.get('engagementType') as EngagementType | null;
    const minRating = validateNumericParam(request.nextUrl.searchParams.get('minRating'), 0);
    const targetAudience = request.nextUrl.searchParams.get('targetAudience') as TargetAudience | null;
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
      ...(categoryId && { categoryId }),
      ...(subcategoryId && { subcategoryId })
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
