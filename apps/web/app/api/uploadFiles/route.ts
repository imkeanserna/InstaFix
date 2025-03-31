import { errorResponse } from "@/lib/errorResponse";
import { PostMedia } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";
import { User } from "next-auth";
import { uploadMultipleFiles } from "@repo/services/src/storage/mediaUpload";
import { currentUser } from "@/lib";

export const runtime = 'edge'

export async function POST(
  request: NextRequest
) {
  try {
    const user: User | undefined = await currentUser();

    if (!user || !user?.id) {
      return errorResponse('User Id is required', undefined, 400);
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return errorResponse('No files provided', undefined, 400);
    }

    const uploadedMedia: PostMedia[] = await uploadMultipleFiles(files);

    return NextResponse.json({
      success: true,
      data: {
        files: uploadedMedia
      }
    })
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
