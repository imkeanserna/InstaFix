import type { NextRequest } from 'next/server'
import { Client } from "@gradio/client";
import { generateQuery, PROFESSIONALS, shouldUseOptions } from '@/app/_lib/ai/queryInstafixChat';

const EXPERTISE_MAP = {
  plumber: "fixing sinks, toilets, pipes, and general plumbing systems",
  mechanic: "repairing cars, engines, and vehicle systems",
  "computer technician": "fixing computers, networks, and technical issues",
  doctor: "treating illnesses, injuries, and health conditions"
};

function formatResponse(aiResponse: string, question: string): string {
  if (!shouldUseOptions(question)) {
    return aiResponse;
  }

  // Extract the professional from the AI response
  const professional = PROFESSIONALS.find(pro =>
    aiResponse.toLowerCase().includes(pro.toLowerCase())
  );

  if (professional) {
    return `Prompt by AI: ${aiResponse}\n\nI know that a ${professional} is good at ${EXPERTISE_MAP[professional as keyof typeof EXPERTISE_MAP]}.`;
  }

  return aiResponse;
}

export async function POST(request: NextRequest) {
  try {
    // Get the question from request body
    const body: any = await request.json();
    const { question } = body;

    if (!question) {
      return Response.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Generate appropriate query based on question type
    const fullQuery = generateQuery(question);

    console.log(fullQuery)

    const client = await Client.connect("kenkurosaki/Very-Fast-Chatbot", {
      hf_token: "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"
    });
    const result: any = await client.predict("/predict", {
      Query: fullQuery,
    });

    // const formattedResponse = formatResponse(result.data[0], question);

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
