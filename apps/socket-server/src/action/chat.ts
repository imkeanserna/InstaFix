import { prisma } from '../db/index';

// export const runtime = 'edge'

export async function getOrCreateConversation({
  initiatorId,
  recipientId
}: {
  initiatorId: string,
  recipientId: string
}) {
  try {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [initiatorId, recipientId]
            },
            leftAt: null
          }
        },
        AND: [
          {
            participants: {
              some: {
                userId: initiatorId
              }
            }
          },
          {
            participants: {
              some: {
                userId: recipientId
              }
            }
          }
        ]
      }
    });

    if (existingConversation) {
      return { conversationId: existingConversation.id, isNew: false };
    }

    const [initiator, recipient] = await Promise.all([
      prisma.user.findUnique({
        where: { id: initiatorId },
        include: {
          _count: {
            select: { posts: true }
          }
        }
      }),
      prisma.user.findUnique({
        where: { id: recipientId },
        include: {
          _count: {
            select: { posts: true }
          }
        }
      })
    ]);

    if (!initiator || !recipient) {
      throw new Error("One or both users not found");
    }

    const initiatorIsFreelancer = initiator._count.posts > 0;
    const recipientIsFreelancer = recipient._count.posts > 0;

    if (initiatorIsFreelancer && !recipientIsFreelancer) {
      // Initiator is freelancer, recipient is client
      const hasBooking = await prisma.booking.findFirst({
        where: {
          freelancerId: initiatorId,
          clientId: recipientId,
          AND: [
            {
              status: {
                in: ["CONFIRMED"]
              }
            }
          ]
        }
      });

      if (!hasBooking) {
        throw new Error("Client cannot message freelancer without an active booking");
      }
    } else if (!initiatorIsFreelancer && recipientIsFreelancer) {
      // Recipient is freelancer, initiator is client
      const hasBooking = await prisma.booking.findFirst({
        where: {
          freelancerId: recipientId,
          clientId: initiatorId,
          AND: [
            {
              status: {
                in: ["CONFIRMED"]
              }
            }
          ]
        }
      });

      if (!hasBooking) {
        throw new Error("Client cannot message freelancer without an active booking");
      }
    }

    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: initiatorId },
            { userId: recipientId }
          ]
        }
      }
    });

    return { conversationId: newConversation.id, isNew: true };
  } catch (error) {
    throw error;
  }
}
