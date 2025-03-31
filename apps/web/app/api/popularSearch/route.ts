import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/server/index';
import { PopularSearch } from "@prisma/client/edge";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);

    if (isNaN(limit) || limit <= 0) {
      return errorResponse('Limit must be a positive number', undefined, 400);
    }

    const popularSearches: PopularSearch[] = await prisma.popularSearch.findMany({
      take: 10,
      orderBy: {
        count: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
