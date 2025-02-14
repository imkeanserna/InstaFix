import { Booking, Post } from '@prisma/client/edge';
import { prisma } from '../db/index';
import { startOfDay, endOfDay } from "date-fns";
import { CreateBookingInput, User } from '../handlers/booking-manager';

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
