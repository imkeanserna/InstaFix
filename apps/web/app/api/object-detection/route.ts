import { IFetchPredictionResponse } from '@repo/types';
import type { NextRequest } from 'next/server'
import { getPostsByProfession } from '../_action/posts/getPosts';
import { fetchAIResponse, handleServiceDetectionQuery } from '../_action/ai/queryInstafixChat';
import { analyzeImageWithHuggingFace } from '../_action/ai/fetchPrediction';
import { parseJsonResponse } from '@/lib/parseJsonResponse';
import { errorResponse } from '@/lib/errorResponse';

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
    const result: IFetchPredictionResponse = await fetchAIResponse(fullQuery);

    const parsedData = parseJsonResponse(result.data[0]);

    console.log(parsedData);

    if ('Professions' in parsedData) {
      const { posts } = await getPostsByProfession(parsedData.Professions);
      console.log(posts);
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
    return errorResponse('Failed to process image', errorMessage);
  }
}
