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

    const conversationWithParticipants = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: {
            NOT: {
              userId
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                createdAt: true
              }
            }
          }
        },
        _count: {
          select: {
            participants: {
              where: {
                userId
              }
            }
          }
        }
      }
    });

    // Check if the current user is a participant
    if (conversationWithParticipants?._count.participants === 0) {
      throw new Error('User is not a participant in this conversation');
    }

    // Calculate unread count
    const unreadCount = await prisma.chatMessage.count({
      where: {
        conversationId,
        isRead: false,
        senderId: {
          not: userId
        },
        NOT: {
          deletedForUsers: {
            some: {
              userId
            }
          }
        }
      }
    });

    // Get messages for this conversation
    // Exclude messages that the user has deleted
    const messages: ChatMessageWithSender[] = await prisma.chatMessage.findMany({
      where: {
        conversationId,
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
        createdAt: 'desc'
      },
      take: take + 1,
      ...(cursor
        ? {
          cursor: {
            id: cursor
          },
          skip: 1
        }
        : {})
    });

    // Check if there are more messages
    const hasNextPage = messages.length > take;

    // If we fetched more than requested, remove the extra item
    const paginatedMessages = hasNextPage
      ? messages.slice(0, take)
      : messages;


    // Sort messages from oldest to newest for display
    const sortedMessages = [...paginatedMessages].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Get the end cursor from the last item
    const endCursor = paginatedMessages.length > 0
      ? paginatedMessages[paginatedMessages.length - 1].id
      : undefined;

    return {
      messages: sortedMessages,
      participants: conversationWithParticipants?.participants.map(p => p.user) || [],
      pagination: {
        hasNextPage,
        endCursor
      },
      unreadCount
    };
  } catch (error) {
    throw error;
  }
}
