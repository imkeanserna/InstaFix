import { prisma } from '@/server/index';
import { ConversationWithRelations } from '@repo/types';

// export const runtime = 'edge'

export async function getConversations({
  userId,
  cursor,
  take
}: {
  userId: string;
  cursor: string | undefined;
  take: number;
}) {
  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    // Find conversations where the user is a participant
    const conversations: ConversationWithRelations[] = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        chatMessages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
        },
        participants: {
          include: {
            user: true
          },
          where: {
            userId: {
              not: userId
            }
          }
        },
        _count: {
          select: {
            chatMessages: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
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

    // Check if there are more conversations
    const hasNextPage = conversations.length > take;

    // If we fetched more than requested, remove the extra item
    const paginatedConversations = hasNextPage
      ? conversations.slice(0, take)
      : conversations;

    // Get the end cursor from the last item
    const endCursor = paginatedConversations.length > 0
      ? paginatedConversations[paginatedConversations.length - 1].id
      : undefined;

    return {
      conversations: paginatedConversations,
      pagination: {
        hasNextPage,
        endCursor
      }
    };
  } catch (error) {
    throw error;
  }
}
