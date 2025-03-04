import { prisma } from '@/server/index';
import { ChatMessageWithSender } from '@repo/types';

// export const runtime = 'edge'

export async function getMessages({
  conversationId,
  userId,
  cursor,
  take
}: {
  conversationId: string;
  userId: string;
  cursor: string | undefined;
  take: number
}) {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    if (!conversationId) {
      throw new Error('Conversation Id is required');
    }

    // Verify user is a participant in this conversation
    const participant = await prisma.participant.findFirst({
      where: {
        userId,
        conversationId
      }
    });

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    // Get messages for this conversation
    const messages: ChatMessageWithSender[] = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        // Exclude messages that the user has deleted
        NOT: {
          deletedForUsers: {
            some: {
              userId
            }
          }
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Most recent messages first
      },
      take: take + 1, // Take one extra to determine if there are more items
      ...(cursor
        ? {
          cursor: {
            id: cursor
          },
          skip: 1 // Skip the cursor item
        }
        : {})
    });

    // Check if there are more messages
    const hasNextPage = messages.length > take;

    // If we fetched more than requested, remove the extra item
    const paginatedMessages = hasNextPage
      ? messages.slice(0, take)
      : messages;

    // Get the end cursor from the last item
    const endCursor = paginatedMessages.length > 0
      ? paginatedMessages[paginatedMessages.length - 1].id
      : undefined;

    return {
      messages: paginatedMessages,
      pagination: {
        hasNextPage,
        endCursor
      }
    };
  } catch (error) {
    throw error;
  }
}
