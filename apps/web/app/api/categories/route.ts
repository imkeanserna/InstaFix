import { errorResponse } from "@/lib/errorResponse";
import { prisma } from '@/server/index';
import { NextResponse } from "next/server";

// export const runtime = "edge";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ name: 'asc', }],
      include: {
        subcategories: true
      }
    })
    return NextResponse.json({
      success: true,
      data: {
        categories: categories
      }
    });
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
