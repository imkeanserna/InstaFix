import { Booking, BookingStatus, Post } from '@prisma/client/edge';
import { prisma } from '../db/index';
import { startOfDay, endOfDay } from "date-fns";
import { CreateBookingInput } from '../handlers/booking-manager';

// export const runtime = 'edge'

export async function addBooking({
  data,
  post,
  userId
}: {
  data: CreateBookingInput,
  post: Post,
  userId: string
}) {
  try {
    const bookingDate = new Date(data.date);

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
      const quantity = data.quantity || 1;
      const totalAmount = post.fixedPrice
        ? post.fixedPrice * quantity
        : post.hourlyRate
          ? post.hourlyRate * quantity
          : 0;

      // Create the booking
      return tx.booking.create({
        data: {
          date: bookingDate,
          startTime: data.startTime ? new Date(data.startTime) : null,
          endTime: data.endTime ? new Date(data.endTime) : null,
          description: data.description,
          quantity: data.quantity,
          totalAmount,
          status: 'PENDING',
          postId: post.id,
          clientId: userId,
          freelancerId: post.userId,
        },
      });
    });

    return booking;
  } catch (error) {
    throw error;
  }
}

export async function updateBooking({
  bookingId,
  clientId,
  freelancerId,
  status
}: {
  bookingId: string,
  clientId: string,
  freelancerId: string,
  status: BookingStatus
}) {
  try {
    const existingBooking = await prisma.booking.findUnique({
      where: {
        id: bookingId
      }
    });

    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // Verify the booking belongs to the correct client and freelancer
    if (existingBooking.clientId !== clientId || existingBooking.freelancerId !== freelancerId) {
      throw new Error('Unauthorized: Booking does not belong to this client/freelancer pair');
    }

    if (existingBooking.status === status) {
      throw new Error(`Booking is already in ${status} status`);
    }

    const booking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status
      }
    });

    return booking;
  } catch (error) {
    throw error;
  }
}
