import { fetchAIResponse, generateInstaFixQuery } from '@/app/_lib/ai/queryInstafixChat';
import { IFetchPredictionResponse } from '@repo/types';
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { question } = body;

    if (!question) {
      return Response.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    const fullQuery = generateInstaFixQuery(question);
    const result: IFetchPredictionResponse = await fetchAIResponse(fullQuery);

    if (result.data[0]?.includes("```json")) {
      return Response.json({
        success: true,
        data: {
          message: JSON.parse(result.data[0]?.replace("```json\n", "").replace("```", ""))
        }
      });
    }

    return Response.json({
      success: true,
      data: JSON.parse(result.data[0])
    });

  } catch (error) {
    console.error('Error processing query:', error);
    return Response.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
