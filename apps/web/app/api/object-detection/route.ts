import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const imageData = await request.blob();

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/detr-resnet-50",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        },
        method: "POST",
        body: imageData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('Result:', result);

    return Response.json(result);

  } catch (error) {
    console.error('Error processing image:', error);
    return Response.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
