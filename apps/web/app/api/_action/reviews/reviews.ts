import { prisma } from '@/server/index';
import { z } from 'zod';

// export const runtime = 'edge'

export async function addReview({
  userId,
  postId,
  rating,
  bookingId,
  comment
}: {
  userId: string;
  postId: string;
  rating: number;
  bookingId: string;
  comment: string;
}) {
  try {
    const review = await prisma.review.findUnique({
      where: {
        postId: postId,
        userId: userId,
        bookingId: bookingId
      }
    });

    if (review && review.userId === userId) {
      throw new Error("You already reviewed this post");
    }

    const newReview = await prisma.review.create({
      data: {
        userId: userId,
        postId: postId,
        rating: rating,
        comment: comment,
        bookingId: bookingId
      }
    });

    if (newReview) {
      const averageRating = await calculateAverageRating(postId);
      await prisma.post.update({
        where: {
          id: postId
        },
        data: {
          averageRating
        }
      });
    }

    return newReview;
  } catch (error) {
    throw error;
  }
}

const CalculateAverageRatingSchema = z.object({
  postId: z.string().min(1, "Post ID is required")
});

async function calculateAverageRating(postId: string) {
  try {
    const validated = CalculateAverageRatingSchema.parse({ postId });

    // Get all reviews for the post
    const reviews = await prisma.review.findMany({
      where: {
        postId: validated.postId
      },
      select: {
        rating: true
      }
    });

    if (reviews.length === 0) {
      return null;
    }

    // Calculate average
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return Math.round(average * 10) / 10;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
}
