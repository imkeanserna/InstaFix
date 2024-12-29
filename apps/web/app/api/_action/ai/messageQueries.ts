import { prisma } from '@/server';
import { Role, Message, Prisma } from "@prisma/client/edge"

export const runtime = 'edge'

interface AddMessageParams {
  sessionId: string;
  question: string;
  responseMessage: string;
}

export const addMessage = async ({ sessionId, question, responseMessage }: AddMessageParams): Promise<{ userMessage: Message; botMessage: Message }> => {
  try {
    const userMessage = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: Role.USER,
        content: question,
      },
    });
    const botMessage = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: Role.BOT,
        content: responseMessage,
      },
    });
    return { userMessage, botMessage };
  } catch (error) {
    throw new Error('Failed to add messages to the database. Please try again later.');
  }
};

interface GetMessagesParams {
  sessionId: string;
  offset: number;
  limit: number;
}

type ChatSessionWithMessages = Prisma.ChatSessionGetPayload<{
  include: { messages: true }
}>;

export const getMessages = async ({
  sessionId,
  offset = 0,
  limit = 10,
}: GetMessagesParams): Promise<Message[]> => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          skip: offset,
          take: limit,
        },
      },
    }) as ChatSessionWithMessages | null;;

    if (!session) {
      throw new Error('Session not found');
    }

    const sortedMessages = [...session?.messages].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sortedMessages;
  } catch (error) {
    throw new Error('Failed to get messages from the database. Please try again later.');
  }
};
