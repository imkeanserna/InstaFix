import { fetchAIResponse, handleServiceDetectionQuery } from '@/app/_lib/ai/queryInstafixChat';
import { IFetchPredictionResponse } from '@repo/types';
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const imageData = await request.blob();
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/git-base",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: imageData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const objectDetection: Array<{ generated_text: string }> = await response.json();
    const fullQuery = handleServiceDetectionQuery(objectDetection[0].generated_text);
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
    console.error('Error processing image:', error);
    return Response.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
