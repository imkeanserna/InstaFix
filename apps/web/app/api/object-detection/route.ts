import { IFetchPredictionResponse, IHuggingFaceResponse } from '@repo/types';
import type { NextRequest } from 'next/server'
import { getSubCategory } from '../_action/posts/getPosts';
import { fetchAIResponse, handleServiceDetectionQuery } from '../_action/ai/queryInstafixChat';
import { analyzeImageWithHuggingFace } from '../_action/ai/fetchPrediction';
import { parseJsonResponse } from '@/lib/parseJsonResponse';
import { ErrorResponse, errorResponse } from '@/lib/errorResponse';
import { Post, Subcategory } from '@prisma/client/edge';

type ObjectDetectionResponseData = {
  posts: Post[]
};

export type SuccessResponse = {
  success: true
  data: ObjectDetectionResponseData | null;
}

export type ObjectDetectionResponse = SuccessResponse | ErrorResponse;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (!request.body) {
      return Response.json(
        { success: false, error: 'No image data provided' },
        { status: 400 }
      );
    }

    const imageData = await request.blob();
    if (imageData.size > MAX_IMAGE_SIZE) {
      return Response.json(
        { success: false, error: 'Image size exceeds maximum limit of 10MB' },
        { status: 400 }
      );
    }

    const objectDetection: IHuggingFaceResponse = await analyzeImageWithHuggingFace(imageData);
    if (objectDetection.generated_text === '') {
      throw new Error('Invalid response from image analysis');
    }

    const fullQuery = handleServiceDetectionQuery(objectDetection.generated_text);
    const result: IFetchPredictionResponse = await fetchAIResponse(fullQuery);
    const parsedData = parseJsonResponse(result.data[0]);

    if (parsedData && 'Professions' in parsedData && parsedData.Professions.length > 0) {
      const subCategories: Subcategory[] | null = await getSubCategory({
        profession: parsedData.Professions
      });
      return Response.json({
        success: true,
        data: {
          detected: objectDetection.generated_text,
          professions: parsedData.Professions,
          subCategories: subCategories
        }
      });
    }
    return Response.json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Please make sure your image is valid, Try again', errorMessage);
  }
}
