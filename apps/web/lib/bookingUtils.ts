import { Booking } from "@prisma/client/edge";
import { TypedBooking } from "@repo/types";

type CreateBookingsResponse = {
  success: boolean;
  data: Booking;
  error?: string;
}

export async function createBooking({
  postId,
  date,
  description,
  quantity,
}: {
  postId: string;
  date: Date;
  description: string;
  quantity: number;
}) {
  try {
    if (!postId) {
      throw new Error('post id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date,
        description: description,
        quantity: quantity
      })
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: CreateBookingsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create booking');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

type GetBookingsResponse = {
  success: boolean;
  data: TypedBooking[];
  error?: string;
}

export async function getBookings({ postId }: { postId: string }) {
  try {
    if (!postId) {
      throw new Error('post id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/booking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: GetBookingsResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create booking');
    }

    return result.data;
  } catch (error) {
    return [];
  }
}

type BookingResponse = {
  success: boolean;
  data: {
    isAvailable: boolean;
    existingBooking: {
      id: string;
      date: string;
      status: string;
    } | null;
  };
  error?: string;
}

export async function getBook({ postId, freelancerId, date }: {
  postId: string,
  freelancerId: string,
  date: Date
}) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/booking/availability?freelancerId=${freelancerId}&date=${date.toISOString().split('T')[0]}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: BookingResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create booking');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}
