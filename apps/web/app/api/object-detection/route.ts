import { IFetchPredictionResponse } from '@repo/types';
import type { NextRequest } from 'next/server'
import { getPostsByProfession } from '../_action/posts/getPosts';
import { fetchAIResponse, handleServiceDetectionQuery } from '../_action/ai/queryInstafixChat';
import { analyzeImageWithHuggingFace } from '../_action/ai/fetchPrediction';
import { parseJsonResponse } from '@/lib/parseJsonResponse';
import { ErrorResponse, errorResponse } from '@/lib/errorResponse';
import { Post } from '@prisma/client';

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

    const objectDetection = await analyzeImageWithHuggingFace(imageData);
    if (!objectDetection?.[0]?.generated_text) {
      throw new Error('Invalid response from image analysis');
    }

    const fullQuery = handleServiceDetectionQuery(objectDetection[0].generated_text);
    console.log(fullQuery)
    const result: IFetchPredictionResponse = await fetchAIResponse(fullQuery);
    console.log(result)

    const parsedData = parseJsonResponse(result.data[0]);

    if ('Professions' in parsedData) {
      const { posts } = await getPostsByProfession(parsedData.Professions);
      return Response.json({
        success: true,
        data: posts
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
