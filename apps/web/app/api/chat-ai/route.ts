import { IChatResponse, IFetchPredictionResponse } from '@repo/types';
import { NextResponse, type NextRequest } from 'next/server'
import { fetchAIResponse, generateInstaFixQuery } from '../_action/ai/queryInstafixChat';
import { isValidQuestion, parseJsonResponse } from '@/lib/parseJsonResponse';
import { errorResponse } from '@/lib/errorResponse';
import { prisma } from '@/server';
import { Message } from "@prisma/client/edge"
import { addMessage, cleanupOldMessages, getMessage, getMessages } from '../_action/ai/messageQueries';
import { fetchChatGroq } from '../_action/ai/fetchPrediction';
import { currentUser } from '@/lib';

interface IRequestBody {
  question: string;
  userId?: string | undefined;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
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

    let sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      const newSession = await prisma.chatSession.create({
        data: {
          userId: user?.id || 'guest',
        },
      });
      sessionId = newSession.id;

      const response = NextResponse.json({
        success: true,
        message: 'Session created successfully',
      });

      response.cookies.set({
        name: 'sessionId',
        value: newSession.id,
        httpOnly: false, // Change to false if you need to access it from JavaScript
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60
      });
      return response;
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to last 10 messages for context
        }
      }
    });

    if (!session) {
      return errorResponse('Session not found', undefined, 404);
    }

    const chatHistory = session.messages
      .reverse()
      .map((msg: Message) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullQuery = generateInstaFixQuery(question, chatHistory);
    // If the HuggingFace model good, we will use this
    // const result: IFetchPredictionResponse = await fetchAIResponse(fullQuery);

    // We use Groq for best use cases as of now
    const result = await fetchChatGroq(fullQuery);

    if (!result?.data?.[0]) {
      throw new Error('Invalid AI response');
    }

    const parsedData: IChatResponse = parseJsonResponse(result.data[0]);

    const { userMessage, botMessage } = await addMessage({ sessionId, question, parsedData });

    return NextResponse.json({
      success: true,
      data: {
        message: botMessage,
        shouldQuery: parsedData.shouldQuery
      }
    });
  } catch (error) {
    console.error('Error processing query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to process query', errorMessage);
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    const messageId = request.nextUrl.searchParams.get('messageId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0', 10);

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (messageId) {
      const message = await getMessage({ messageId, sessionId });
      if (!message) {
        return NextResponse.json(
          { success: false, message: 'Message not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: message
      });
    }

    const messages = await getMessages({ sessionId, limit, offset });

    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to process query', errorMessage);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'User Id is required' },
        { status: 400 }
      );
    }
    const deletedCount = await cleanupOldMessages({ userId: user.id });
    return NextResponse.json({
      success: true,
      deletedCount
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to remove old messages', errorMessage);
  }
}
