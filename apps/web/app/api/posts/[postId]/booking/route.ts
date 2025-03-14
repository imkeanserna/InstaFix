import { errorResponse } from "@/lib/errorResponse";
import { NextRequest, NextResponse } from "next/server";
import { User } from "next-auth";
import { currentUser } from "@/lib";
import { prisma } from '@/server/index';
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";
import { TypedBooking } from "@repo/types";
import { Booking } from "@prisma/client/edge";

// export const runtime = 'edge';

const createBookingSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  description: z.string()
    .min(5, "Description must be at least 5 characters long")
    .max(500, "Description must not exceed 500 characters")
    .trim(),
  quantity: z.number().positive(),
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
    const validatedData = createBookingSchema.parse(body);
    const bookingDate = new Date(validatedData.date);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        fixedPrice: true,
        hourlyRate: true,
      },
    });

    if (!post) {
      return errorResponse('Post not found', undefined, 404);
    }

    if (post.userId === user?.id) {
      return NextResponse.json(
        { error: "Cannot book your own service" },
        { status: 400 }
      );
    }

    const booking: Booking = await prisma.$transaction(async (tx) => {
      // Check for existing booking with pessimistic locking
      const existingBooking = await tx.booking.findFirst({
        where: {
          freelancerId: post.userId,
          date: {
            gte: startOfDay(bookingDate),
            lte: endOfDay(bookingDate),
          },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      });

      if (existingBooking) {
        throw new Error('Date already booked');
      }

      // Calculate total amount based on pricing type
      const quantity = validatedData.quantity || 1;
      const totalAmount = post.fixedPrice
        ? post.fixedPrice * quantity
        : post.hourlyRate
          ? post.hourlyRate * quantity
          : 0;

      // Create the booking
      return tx.booking.create({
        data: {
          date: bookingDate,
          startTime: validatedData.startTime ? new Date(validatedData.startTime) : null,
          endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
          description: validatedData.description,
          quantity: validatedData.quantity,
          totalAmount,
          status: 'PENDING',
          postId: postId,
          clientId: user?.id!,
          freelancerId: post.userId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: booking
    });
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return errorResponse('Post not found', undefined, 404);
    }

    const bookings: TypedBooking[] = await prisma.booking.findMany({
      where: {
        postId: postId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        id: true,
        date: true,
        status: true,
        client: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
