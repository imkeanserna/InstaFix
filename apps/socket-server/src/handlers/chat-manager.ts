import { ChatEventType } from "@prisma/client/edge";
import { AuthenticatedWebSocket } from "..";
import { DirectMessagingPubSub } from "../pubsub/redisClient";
import { prisma } from "../db";
import {
  ChatMessageWithSender,
  DeleteMessagePayload,
  deleteMessageSchema,
  MessageType,
  ReadStatusPayload,
  readStatusSchema,
  SendMessagePayload,
  sendMessageSchema,
  StartConversationPayload,
  startConversationSchema,
  TypingStatusPayload,
  typingStatusSchema,
} from "@repo/types";
import { getOrCreateConversation } from "../action/chat";
import { getOrCreateSystemUser } from "../action/system";

export const runtime = 'edge'

export interface ChatEvent {
  type: ChatEventType;
  payload: any;
}

export const BOOKING_CONFIRMATION_MESSAGE =
  'The booking has been successfully confirmed! You may now communicate with the other party to discuss the project details.';

export class ChatManager {
  private messagingService: DirectMessagingPubSub;

  constructor() {
    this.messagingService = DirectMessagingPubSub.getInstance();
  }

  public async handleChatEvent(user: AuthenticatedWebSocket, message: ChatEvent): Promise<void> {
    const { type, payload } = message;

    try {
      switch (type as Exclude<ChatEventType, "DELIVERED">) {
        case ChatEventType.START_CONVERSATION:
          await this.handleStartConversation(user, payload as StartConversationPayload);
          break;
        case ChatEventType.SENT:
          await this.handleSendMessage(user, payload as SendMessagePayload);
          break;
        case ChatEventType.READ:
          await this.handleReadStatus(user, payload as ReadStatusPayload);
          break;
        case ChatEventType.TYPING:
        case ChatEventType.STOPPED_TYPING:
          await this.handleTypingStatus(user, payload as TypingStatusPayload);
          break;
        case ChatEventType.DELETED:
          await this.handleDeleteMessage(user, payload as DeleteMessagePayload);
          break;
        default:
          throw new Error('Invalid message event type');
      }
    } catch (error) {
      console.error('Message handling error:', error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async handleSendMessage(user: AuthenticatedWebSocket, data: SendMessagePayload) {
    try {
      const result = sendMessageSchema.safeParse({
        conversationId: data.conversationId,
        body: data.body,
        files: (data.files && data.files?.length > 0) ? [data.files[0]?.url] : undefined,
      });

      if (!result.success) {
        throw new Error(`Invalid message format: ${result.error.message}`);
      }

      const { conversationId, body } = result.data;

      const { recipient } = await this.validateConversationAccess(
        conversationId,
        user.userId
      );

      const message: ChatMessageWithSender = await prisma.chatMessage.create({
        data: {
          body,
          image: data.files && data.files?.length > 0 ? data.files[0]?.url : undefined,
          senderId: user.userId,
          conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      await prisma.conversation.update({
        where: {
          id: conversationId
        },
        data: {
          lastMessageAt: new Date()
        }
      });

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.SENT,
        message,
        recipient
      );

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.DELIVERED,
        message,
        user.userId
      );
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async handleStartConversation(user: AuthenticatedWebSocket, data: StartConversationPayload) {
    try {
      const result = startConversationSchema.safeParse(data);
      if (!result.success) {
        throw new Error(`Invalid message format: ${result.error.message}`);
      }
      const { recipientId } = result.data;

      const { conversationId, isNew } = await getOrCreateConversation({
        initiatorId: user.userId,
        recipientId
      });

      if (isNew) {
        this.messagingService.notifyUsers(
          MessageType.CHAT,
          ChatEventType.CONVERSATION_CREATED,
          { conversationId },
          user.userId
        );

        this.messagingService.notifyUsers(
          MessageType.CHAT,
          ChatEventType.CONVERSATION_CREATED,
          { conversationId },
          recipientId
        );
      }
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  public async createInitialConversation(user: AuthenticatedWebSocket, booking: {
    id: string;
    freelancerId: string;
    clientId: string;
  }) {
    try {
      const { conversationId, isNew } = await getOrCreateConversation({
        initiatorId: booking.freelancerId,
        recipientId: booking.clientId
      });

      const systemUser = await getOrCreateSystemUser();

      const message = await prisma.chatMessage.create({
        data: {
          conversationId,
          senderId: systemUser.id,
          body: BOOKING_CONFIRMATION_MESSAGE,
          bookingId: booking.id,
          isSystemMessage: true,
          isRead: false
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })

      // Update conversation's lastMessageAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      })

      // Only notify about conversation creation if it's new
      if (isNew) {
        this.messagingService.notifyUsers(
          MessageType.CHAT,
          ChatEventType.CONVERSATION_CREATED,
          { conversationId, bookingId: booking.id },
          booking.clientId
        );

        this.messagingService.notifyUsers(
          MessageType.CHAT,
          ChatEventType.CONVERSATION_CREATED,
          { conversationId, bookingId: booking.id },
          booking.freelancerId
        );
      }

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.SENT,
        message,
        booking.clientId
      );

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.SENT,
        message,
        booking.freelancerId
      );
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async handleTypingStatus(user: AuthenticatedWebSocket, data: TypingStatusPayload) {
    try {
      const result = typingStatusSchema.safeParse(data);
      if (!result.success) {
        throw new Error(`Invalid message format: ${result.error.message}`);
      }
      const { conversationId, status } = result.data;

      const { recipient } = await this.validateConversationAccess(
        conversationId,
        user.userId
      );

      const typingStatus = {
        conversationId,
        userId: user.userId,
        status,
        timestamp: new Date()
      };

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        status,
        typingStatus,
        recipient
      );
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async handleReadStatus(user: AuthenticatedWebSocket, data: ReadStatusPayload) {
    try {
      const result = readStatusSchema.safeParse(data);
      if (!result.success) {
        throw new Error(`Invalid message format: ${result.error.message}`);
      }
      const { conversationId } = result.data;

      const { recipient } = await this.validateConversationAccess(
        conversationId,
        user.userId
      );

      // Update messages as read in the database
      await prisma.chatMessage.updateMany({
        where: {
          conversationId,
          senderId: { not: user.userId },
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      // Update participant status to indicate they've seen the latest messages
      await prisma.participant.updateMany({
        where: {
          conversationId,
          userId: user.userId,
          hasSeenLatest: false
        },
        data: {
          hasSeenLatest: true
        }
      });

      const updatedMessages = await prisma.chatMessage.findMany({
        where: {
          conversationId,
          senderId: { not: user.userId },
          isRead: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });

      const readStatus = {
        conversationId,
        userId: user.userId,
        messageIds: updatedMessages.map(msg => msg.id),
        timestamp: new Date()
      };

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.READ,
        readStatus,
        user.userId
      );

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.READ,
        readStatus,
        recipient
      );
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async handleDeleteMessage(user: AuthenticatedWebSocket, data: DeleteMessagePayload) {
    try {
      const result = deleteMessageSchema.safeParse(data);
      if (!result.success) {
        throw new Error(`Invalid message format: ${result.error.message}`);
      }
      const { conversationId, messageId } = result.data;

      const { recipient } = await this.validateConversationAccess(
        conversationId,
        user.userId
      );

      // Check the message exists and belongs to the conversation
      const message = await prisma.chatMessage.findFirst({
        where: {
          id: messageId,
          conversationId
        },
        include: {
          deletedForUsers: {
            where: {
              userId: user.userId
            }
          }
        }
      });

      if (!message) {
        throw new Error('Message not found in this conversation');
      }

      // Check the user is the sender (users should only delete their own messages)
      if (message.senderId !== user.userId) {
        throw new Error('You can only delete messages you have sent');
      }

      // Check the message is already deleted by this user
      if (message.deletedForUsers.length > 0) {
        throw new Error('This message has already been deleted');
      }

      await prisma.deletedMessage.create({
        data: {
          messageId: message.id,
          userId: user.userId
        }
      });

      const deleteStatus = {
        conversationId: message.conversationId,
        messageId: message.id,
        deletedBy: user.userId,
        deletedAt: new Date()
      };

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.DELETED,
        deleteStatus,
        user.userId
      );

      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.DELETED,
        deleteStatus,
        recipient
      );
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async validateConversationAccess(
    conversationId: string,
    userId: string
  ): Promise<{
    recipient: string;
  }> {
    const participant = await prisma.participant.findFirst({
      where: {
        userId,
        conversationId,
        leftAt: null // Ensure user hasn't left the conversation
      },
      select: {
        conversation: {
          select: {
            participants: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!participant) {
      throw new Error('User is not authorized to send messages to this conversation');
    }

    const recipient = participant.conversation.participants
      .find((p) => p.user.id !== userId);

    if (!recipient) {
      throw new Error('User is not authorized to send messages to this conversation');
    }

    return {
      recipient: recipient.user.id
    }
  }
}
