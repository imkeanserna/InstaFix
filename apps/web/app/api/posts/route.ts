import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "../_action/posts/getPosts";
import { ResponseDataWithLocation, ResponseDataWithoutLocation, FilterOptions } from "@repo/types";
import { parseLocationParams, parsePriceParams, parseServicesIncluded, validateNumericParam } from "../_action/helper/postUtils";
import { EngagementType, TargetAudience } from "@prisma/client/edge";
import { trackPopularSearch } from "../_action/posts/searchQuery";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10');

    if (page < 1) throw new Error('Page must be greater than 0');
    if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');

    const categoryName = request.nextUrl.searchParams.get('category');
    const subcategoryName = request.nextUrl.searchParams.get('subcategory');

    if (subcategoryName && !categoryName) {
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

    const filterOptions: FilterOptions = {
      page,
      limit,
      ...(searchQuery && { searchQuery }),
      ...(location && { location }),
      ...(price && { price }),
      ...(engagementType && { engagementType }),
      ...(minRating > 0 && { minRating }),
      ...(targetAudience && { targetAudience }),
      ...(servicesIncluded?.length && { servicesIncluded }),
      ...(categoryName && { categoryName }),
      ...(subcategoryName && { subcategoryName })
    };

    const result: ResponseDataWithLocation | ResponseDataWithoutLocation = await getPosts(filterOptions);

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
