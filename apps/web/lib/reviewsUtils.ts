import { Review } from "@prisma/client/edge";
import { ReviewsResponseWithCursor } from "@repo/types";

export type GetReviewsResponse = {
  success: boolean;
  data: ReviewsResponseWithCursor;
  error?: string;
}

export async function getReviews({ postId, cursor, take }: {
  postId: string;
  cursor?: string | null;
  take: number;
}): Promise<{
  data: ReviewsResponseWithCursor | [];
  nextCursor?: string | undefined;
}> {
  const queryParams = new URLSearchParams();
  queryParams.append("take", String(take));

  if (cursor) {
    queryParams.append("cursor", cursor);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    if (!postId) {
      throw new Error('post id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/reviews?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetReviewsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get response from chat AI');
    }

    return {
      data: result.data,
      nextCursor: result.data.reviews.length > 0 ? result.data.pagination?.endCursor : undefined
    };

  } catch (error) {
    clearTimeout(timeout);
    return {
      data: [],
      nextCursor: undefined
    };
  }
}

export type AddReviewResponse = {
  success: boolean;
  data: Review;
  error?: string;
}

export async function addReview({
  postId,
  bookingId,
  rating,
  comment
}: {
  postId: string;
  bookingId: string;
  rating: number;
  comment: string;
}) {
  try {
    if (!postId) {
      throw new Error('post id is required');
    }

    if (!bookingId) {
      throw new Error('booking id is required');
    }

    const queryParams = new URLSearchParams();
    queryParams.append("bookingId", String(bookingId));

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/posts/${postId}/reviews?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating,
        comment
      })
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: AddReviewResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create review');
    }

    return result.data;
  } catch (error) {
    console.log(error)
    throw error;
  }
}
