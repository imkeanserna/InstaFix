import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "../_action/posts/getPosts";
import { ResponseDataWithLocation, ResponseDataWithoutLocation } from "@repo/types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10');
    const categoryName = request.nextUrl.searchParams.get('category');
    const subcategoryName = request.nextUrl.searchParams.get('subcategory');
    const latitude = request.nextUrl.searchParams.get('latitude');
    const longitude = request.nextUrl.searchParams.get('longitude');
    const radiusInKm = parseFloat(request.nextUrl.searchParams.get('radius') ?? '10');

    if (subcategoryName && !categoryName) {
      return errorResponse('Category is required when filtering by subcategory', undefined, 400);
    }

    const result: ResponseDataWithLocation | ResponseDataWithoutLocation = await getPosts({
      page, limit, categoryName, subcategoryName, location: {
        latitude: parseFloat(latitude ?? '0'),
        longitude: parseFloat(longitude ?? '0'),
        radiusInKm
      }
    });
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
