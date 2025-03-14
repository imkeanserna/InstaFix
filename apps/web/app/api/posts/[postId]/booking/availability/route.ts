import { errorResponse } from '@/lib/errorResponse';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { User } from "next-auth";
import { currentUser } from "@/lib";
import { prisma } from '@/server/index';

// export const runtime = 'edge';

const QuerySchema = z.object({
  freelancerId: z.string({
    required_error: "freelancerId is required",
    invalid_type_error: "freelancerId must be a string"
  }).min(1, "freelancerId cannot be empty"),
  date: z.string({
    required_error: "date is required",
    invalid_type_error: "date must be a string"
  }).refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Invalid date format")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const inputDate = new Date(date);
      inputDate.setHours(0, 0, 0, 0);

      return inputDate >= today;
    }, "Cannot book dates in the past")
});

type ValidatedQuery = z.infer<typeof QuerySchema>;

export async function GET(
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

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validationResult = QuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(error => error.message);
      return errorResponse('Validation failed', errorMessages[0], 400);
    }

    const { freelancerId, date }: ValidatedQuery = validationResult.data;
    const normalizedDate = new Date(date + 'T00:00:00.000Z');

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return errorResponse('Post not found', undefined, 404);
    }

    if (post.userId !== freelancerId) {
      return errorResponse('Freelancer is not associated with this post', undefined, 400);
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        freelancerId: freelancerId,
        date: {
          equals: normalizedDate
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED']
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isAvailable: !existingBooking,
        existingBooking: existingBooking ? {
          id: existingBooking.id,
          date: existingBooking.date,
          status: existingBooking.status
        } : null
      }
    });
  } catch (error) {
    console.log("error", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
