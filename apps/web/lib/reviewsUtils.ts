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
