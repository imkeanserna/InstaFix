import { AccountType, Booking, BookingStatus, Post } from '@prisma/client/edge';
import { prisma } from '../db/index';
import { startOfDay, endOfDay } from "date-fns";
import { CreateBookingInput } from '../handlers/booking-manager';
import { validateBookingCancellation } from '@repo/types';

export const runtime = 'edge'

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
          AND: [
            {
              freelancerId: post.userId,
              date: {
                gte: startOfDay(bookingDate),
                lte: endOfDay(bookingDate),
              },
              status: {
                in: ['PENDING', 'CONFIRMED']
              }
            }
          ]
        },
      });

      if (existingBooking) {
        throw new Error('Date already has an active booking');
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

    if (status === BookingStatus.CONFIRMED) {
      const freelancer = await prisma.user.findUnique({
        where: { id: freelancerId }
      });

      if (!freelancer) {
        throw new Error('Freelancer not found');
      }

      // Check if freelancer has credits (unless they have premium account)
      if (freelancer.accountType !== AccountType.PREMIUM && freelancer.credits <= 0) {
        throw new Error('Insufficient credits to confirm this booking');
      }

      // If not premium, deduct 1 credit and record the transaction
      if (freelancer.accountType !== AccountType.PREMIUM) {
        await prisma.user.update({
          where: { id: freelancerId },
          data: {
            credits: { decrement: 1 }
          }
        });

        await prisma.creditTransaction.create({
          data: {
            userId: freelancerId,
            amount: -1,
            description: `Credit used for booking ${bookingId}`
          }
        });
      }
    }

    if (status === BookingStatus.CANCELLED) {
      const validation = validateBookingCancellation({
        booking: {
          id: bookingId,
          clientId,
          date: existingBooking.date,
          createdAt: existingBooking.createdAt
        },
        userId: clientId
      });

      if (!validation.canCancel && validation.message) {
        throw new Error(validation.message);
      }
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
