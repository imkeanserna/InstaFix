import { BookingEventType, ChatEventType } from "@prisma/client/edge";
import { AuthenticatedWebSocket } from "..";
import { DirectMessagingPubSub } from "../pubsub/redisClient";
import { prisma } from "../db";
import { MessageType, NotificationType } from "@repo/types";
import { getOrCreateConversation } from "../action/chat";

export interface ChatEvent {
  type: ChatEventType;
  payload: any;
}

type SendMessagePayload = {
  conversationId: string;
  body?: string;
  image?: string;
}

export class ChatManager {
  private messagingService: DirectMessagingPubSub;

  constructor() {
    this.messagingService = DirectMessagingPubSub.getInstance();
  }

  public async handleChatEvent(user: AuthenticatedWebSocket, message: ChatEvent): Promise<void> {
    const { type, payload } = message;

    try {
      switch (type as ChatEventType) {
        case ChatEventType.START_CONVERSATION:
          const conversationId: string = await getOrCreateConversation({
            initiatorId: user.userId,
            recipientId: payload.recipientId
          });
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
            payload.recipientId
          );
          break;
        case ChatEventType.SENT:
          await this.handleSendMessage(user, payload);
          break;
        case ChatEventType.DELIVERED:
          // await this.handleDeliveryStatus(user, payload);
          break;
        case ChatEventType.READ:
          // await this.handleReadStatus(user, payload);
          break;
        case ChatEventType.TYPING:
        case ChatEventType.STOPPED_TYPING:
          // await this.handleTypingStatus(user, { ...payload, status: type });
          break;
        case ChatEventType.DELETED:
          // await this.handleDeleteMessage(user, payload);
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
      const conversationId = data.conversationId;
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }

      const participant = await prisma.participant.findFirst({
        where: {
          userId: user.userId,
          conversationId: conversationId,
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
                      name: true
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

      const message = await prisma.chatMessage.create({
        data: {
          body: data.body,
          image: data.image,
          senderId: user.userId,
          conversationId: data.conversationId
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

      const recipient = participant.conversation.participants
        .find((p) => p.user.id !== user.userId);

      if (!recipient) {
        throw new Error('Recipient not found');
      }

      await prisma.conversation.update({
        where: {
          id: data.conversationId
        },
        data: {
          lastMessageAt: new Date()
        }
      });

      // --TODO: add chat notification
      this.messagingService.notifyUsers(
        MessageType.CHAT,
        ChatEventType.SENT,
        message,
        recipient?.user.id
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
}
