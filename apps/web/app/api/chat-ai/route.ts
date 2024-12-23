import { IChatGPTResponse, IFetchPredictionResponse } from '@repo/types';
import type { NextRequest } from 'next/server'
import { fetchAIResponse, generateInstaFixQuery } from '../_action/ai/queryInstafixChat';
import { isValidQuestion, parseJsonResponse } from '@/lib/parseJsonResponse';
import { errorResponse } from '@/lib/errorResponse';

interface IRequestBody {
  question: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json() as Partial<IRequestBody>;
    const { question } = body;

    if (!question) {
      return errorResponse('Question is required', undefined, 400);
    }

    if (!isValidQuestion(question)) {
      return errorResponse(
        'Invalid question format',
        'Question must be a non-empty string with maximum 1000 characters',
        400
      );
    }

    const fullQuery = generateInstaFixQuery(question);
    const result: IFetchPredictionResponse = await fetchAIResponse(fullQuery);

    if (!result?.data?.[0]) {
      throw new Error('Invalid AI response');
    }

    const parsedData: IChatGPTResponse = parseJsonResponse(result.data[0]);
    return Response.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('Error processing query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to process query', errorMessage);
  }
}
