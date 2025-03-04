import { ChatEventType, ChatMessage, Conversation, Participant, User } from "@prisma/client/edge";
import { CursorPagination } from "./postTypes";

export type SendMessagePayload = {
  conversationId: string;
  body?: string;
  image?: string;
}

export type StartConversationPayload = {
  recipientId: string;
}

export type TypingStatus = Pick<typeof ChatEventType, 'TYPING' | 'STOPPED_TYPING'>[keyof Pick<typeof ChatEventType, 'TYPING' | 'STOPPED_TYPING'>];

export type TypingStatusPayload = {
  conversationId: string;
  status: TypingStatus;
}

export type ReadStatusPayload = {
  conversationId: string;
}

export type DeleteMessagePayload = {
  messageId: string;
  conversationId: string;
}

export interface ConversationWithRelations extends Conversation {
  chatMessages: ChatMessage[];
  participants: (Participant & {
    user: User;
  })[];
  _count: {
    chatMessages: number;
  };
  unreadCount: number;
}

export interface GetConversationsResult {
  conversations: ConversationWithRelations[];
  pagination: CursorPagination;
}

export interface MessageSender {
  id: string;
  name?: string | null;
  image?: string | null;
}

export interface ChatMessageWithSender extends Omit<ChatMessage, 'sender'> {
  sender: MessageSender;
}

export interface GetMessagesResult {
  messages: ChatMessageWithSender[];
  pagination: CursorPagination;
}
