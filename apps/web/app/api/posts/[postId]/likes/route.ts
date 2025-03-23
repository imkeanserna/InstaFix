import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/errorResponse";
import { prisma } from '@/server/index';
import { User } from "next-auth";
import { currentUser } from "@/lib";

// export const runtime = 'edge';

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
      return NextResponse.json({
        success: false,
        data: null
      })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: user.id
        }
      }
    });

    if (existingLike) {
      const result = await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
      return NextResponse.json({
        success: true,
        data: {
          favorite: result,
          isLike: false
        }
      })
    } else {
      const result = await prisma.like.create({
        data: {
          postId: postId,
          userId: user.id,
        },
        select: {
          id: true,
          post: {
            select: {
              id: true,
              title: true,
              user: {
                select: {
                  name: true
                }
              },
              location: {
                select: {
                  city: true,
                  state: true,
                  country: true
                }
              },
              averageRating: true,
              coverPhoto: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          createdAt: true
        }
      });
      return NextResponse.json({
        success: true,
        data: {
          favorite: result,
          isLike: true
        }
      })
    }
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
