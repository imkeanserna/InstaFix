import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/errorResponse";
import { currentUser } from "@/lib";
import { prisma } from '@/server/index';
import { User } from "next-auth";
import { z } from 'zod';
import { addReview } from "@/app/api/_action/reviews/reviews";
import { Review } from "@prisma/client/edge";
import { ReviewsResponseWithCursor } from "@repo/types";

export const runtime = 'edge';

const ReviewSchema = z.object({
  rating: z.number({
    required_error: "Rating is required",
    invalid_type_error: "Rating must be a number"
  }).min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
  comment: z.string({
    required_error: "Comment is required",
    invalid_type_error: "Comment must be a string"
  }).min(1, "Comment cannot be empty")
    .max(640, "Comment cannot exceed 640 characters")
});

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params?.postId;
    if (!postId) {
      return errorResponse('post id is required', undefined, 400);
    }

    const user: User | undefined = await currentUser();
    if (!user || !user?.id) {
      return errorResponse('User Id is required', undefined, 400);
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const validatedBody = ReviewSchema.safeParse(body);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return errorResponse('booking id is required', undefined, 400);
    }

    if (!validatedBody.success) {
      return errorResponse(
        'Invalid request body',
        validatedBody.error.errors[0].message,
        400
      );
    }
    const { rating, comment } = validatedBody.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return errorResponse('Post is not found', undefined, 404);
    }

    if (post.userId === user.id) {
      return errorResponse('You cannot review your own post', undefined, 400);
    }

    const result: Review = await addReview({
      userId: user.id,
      postId: post.id,
      rating,
      comment,
      bookingId
    });

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params?.postId;
    if (!postId) {
      return errorResponse('post id is required', undefined, 400);
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const take = Number(searchParams.get('take')) || 10;

    const reviews = await prisma.review.findMany({
      take: take + 1,
      where: {
        postId: postId
      },
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1
      }),
      include: {
        user: {
          select: {
            name: true,
            image: true,
            createdAt: true,
            location: {
              select: {
                fullAddress: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const hasNextPage = reviews.length > take;
    const paginatedReviews = hasNextPage ? reviews.slice(0, -1) : reviews;

    const response: ReviewsResponseWithCursor = {
      reviews: paginatedReviews,
      pagination: {
        hasNextPage,
        endCursor: hasNextPage ? paginatedReviews[paginatedReviews.length - 1].id : undefined
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
