import { prisma } from '@/server';
import { Role, Message, Post, ChatSession } from "@prisma/client/edge"
import { IChatResponse, QueryType } from '@repo/types';
import { MessagesWithPosts } from '@repo/types'
import { subDays } from 'date-fns';

export const runtime = 'edge'

interface AddMessageParams {
  sessionId: string;
  question: string;
  parsedData: IChatResponse
}

export const addMessage = async ({ sessionId, question, parsedData }: AddMessageParams): Promise<{ userMessage: Message; botMessage: Message }> => {
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
        content: parsedData.message,
      },
    });

    if (parsedData.shouldQuery && parsedData.tag !== null && parsedData.queryType === QueryType.FIND_PROFESSIONALS) {
      handleMessagePosts({ message: botMessage, tags: parsedData.tag });
    }

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

export const getMessages = async ({
  sessionId,
  offset = 0,
  limit = 10,
}: GetMessagesParams): Promise<MessagesWithPosts[]> => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          include: {
            messagePosts: {
              take: 5,
              include: {
                post: {
                  include: {
                    tags: {
                      include: {
                        subcategory: {
                          include: {
                            category: true
                          }
                        }
                      }
                    },
                    user: true
                  }
                }
              }
            },
            _count: {
              select: { messagePosts: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: offset,
          take: limit,
        },
      },
    });

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

export const getMessage = async ({ sessionId, messageId }: {
  sessionId: string;
  messageId: string
}): Promise<MessagesWithPosts | null> => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          where: {
            id: messageId
          },
          include: {
            messagePosts: {
              take: 5,
              include: {
                post: {
                  include: {
                    tags: {
                      include: {
                        subcategory: {
                          include: {
                            category: true
                          }
                        }
                      }
                    },
                    user: true
                  }
                }
              }
            },
            _count: {
              select: { messagePosts: true }
            }
          }
        }
      }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session.messages[0];
  } catch (error) {
    throw new Error('Failed to get message from the database. Please try again later.');
  }
}

interface MessagePosts {
  message: Message;
  tags: string[]
}

export const handleMessagePosts = async ({ message, tags }: MessagePosts): Promise<void> => {
  if (tags.length > 0) {
    const relatedPosts: Post[] = await prisma.post.findMany({
      where: {
        tags: {
          some: {
            subcategory: {
              name: {
                in: tags
              }
            }
          }
        }
      },
      include: {
        tags: {
          include: {
            subcategory: true
          }
        }
      }
    })

    await prisma.messagePost.createMany({
      data: relatedPosts.map((post: Post) => ({
        messageId: message.id,
        postId: post.id
      })),
      skipDuplicates: true
    });
  }
};

export const cleanupOldMessages = async ({ userId }: { userId: string }): Promise<number> => {
  const oneDayAgo = subDays(new Date(), 1);

  try {
    if (!userId) {
      throw new Error('User Id is required');
    }

    const deletedSessions = await prisma.chatSession.deleteMany({
      where: {
        userId: userId,
        createdAt: {
          lt: oneDayAgo
        }
      }
    });
    return deletedSessions.count;
  } catch (error) {
    throw new Error(`Failed to cleanup old messages: ${error}`);
  }
};

export const removeChatSession = async ({ sessionId }: { sessionId: string }): Promise<ChatSession> => {
  try {
    if (!sessionId) {
      throw new Error('User Id is required');
    }

    const deletedSession = await prisma.chatSession.delete({
      where: {
        id: sessionId
      }
    });
    return deletedSession;
  } catch (error) {
    throw new Error(`Failed to cleanup old messages: ${error}`);
  }
};
