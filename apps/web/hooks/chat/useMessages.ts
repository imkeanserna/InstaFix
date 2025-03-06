"use client";

import { WebSocketMessage } from "@/context/WebSocketProvider";
import { getMessages } from "@/lib/chatUtils";
import { ChatEventType } from "@prisma/client/edge";
import {
  ChatMessageWithSender,
  DeleteMessagePayload,
  ErrorPayload,
  GetMessagesResult,
  MessageType,
  ReadStatusPayload,
  SendMessagePayload,
  StartConversationPayload,
  TypingStatus,
  TypingStatusPayload
} from "@repo/types";
import { toast } from "@repo/ui/components/ui/sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWebSocket } from "../useWebSocket";

export const useMessages = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesState, setMessagesState] = useState<GetMessagesResult>({
    messages: [],
    participants: [],
    unreadCount: 0,
    pagination: {
      hasNextPage: false,
      endCursor: undefined,
    },
  });

  const { sendMessage } = useWebSocket();
  const { sendReadStatus } = useMessagesActions(sendMessage);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMessages({ conversationId, take: 20 });

      setMessagesState({
        messages: result.data.messages,
        participants: result.data.participants,
        unreadCount: result.data.unreadCount,
        pagination: result.data.pagination,
      });

      if (result.data.unreadCount > 0) {
        sendReadStatus(MessageType.CHAT, { conversationId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId, fetchMessages]);

  const loadMore = useCallback(async () => {
    if (!messagesState.pagination.hasNextPage || isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMessages({
        conversationId,
        cursor: messagesState.pagination.endCursor,
        take: 20,
      });
      setMessagesState((prev) => ({
        messages: [...prev.messages, ...result.data.messages],
        participants: result.data.participants,
        unreadCount: result.data.unreadCount,
        pagination: result.data.pagination,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more messages");
    } finally {
      setIsLoading(false);
    }
  }, [
    conversationId,
    messagesState.pagination.hasNextPage,
    messagesState.pagination.endCursor,
    isLoading
  ]);

  const refresh = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = useCallback((message: ChatMessageWithSender) => {
    setMessagesState((prev) => ({
      ...prev,
      messages: [message, ...prev.messages],
    }));
  }, []);

  const updateMessage = useCallback((updatedMessage: ChatMessageWithSender) => {
    setMessagesState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      ),
    }));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessagesState((prev) => ({
      ...prev,
      messages: prev.messages.filter((msg) => msg.id !== messageId),
    }));
  }, []);

  return useMemo(() => ({
    messagesState,
    isLoading,
    error,
    loadMore,
    refresh,
    addMessage,
    updateMessage,
    removeMessage,
    hasMore: messagesState.pagination.hasNextPage
  }), [
    messagesState,
    isLoading,
    error,
    loadMore,
    refresh,
    addMessage,
    updateMessage,
    removeMessage
  ]);
}

export function useMessagesActions(sendMessage: Function) {
  const sendReadStatus = useCallback(
    (event: MessageType, data: ReadStatusPayload) => {
      const payload = {
        type: ChatEventType.READ,
        payload: {
          conversationId: data.conversationId,
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  const startConversation = useCallback(
    (event: MessageType, data: StartConversationPayload) => {
      const payload = {
        type: ChatEventType.START_CONVERSATION,
        payload: {
          recipientId: data.recipientId,
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  const sendTextMessage = useCallback(
    (event: MessageType, data: SendMessagePayload) => {
      const payload = {
        type: ChatEventType.SENT,
        payload: {
          conversationId: data.conversationId,
          body: data.body,
          image: data.image,
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  const sendTypingStatus = useCallback(
    (event: MessageType, data: TypingStatusPayload) => {
      const payload = {
        type: ChatEventType.TYPING,
        payload: {
          conversationId: data.conversationId,
          status: data.status as TypingStatus,
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  const sendStoppedTypingStatus = useCallback(
    (event: MessageType, data: TypingStatusPayload) => {
      const payload = {
        type: ChatEventType.STOPPED_TYPING,
        payload: {
          conversationId: data.conversationId,
          status: data.status as TypingStatus,
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  const deleteMessage = useCallback(
    (event: MessageType, data: DeleteMessagePayload) => {
      const payload = {
        type: ChatEventType.DELETED,
        payload: {
          messageId: data.messageId,
          conversationId: data.conversationId,
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage]
  );

  return {
    sendReadStatus,
    startConversation,
    sendTextMessage,
    sendTypingStatus,
    sendStoppedTypingStatus,
    deleteMessage
  }
}

export type ReadStatusResult = {
  conversationId: string;
  userId?: string;
  messageIds: string[];
  timestamp?: Date;
}

export function useChatEventHandler({
  lastMessage,
  onReadStatusUpdate,
  onStartConversation,
  onSendMessage,
  onTypingStatus,
  onDeleteMessage,
  onError,
  setIsLoading
}: {
  lastMessage: WebSocketMessage | null;
  onReadStatusUpdate?: (readStatus: ReadStatusResult) => void;
  onStartConversation?: (startConversation: StartConversationPayload) => void;
  onSendMessage?: (sendMessage: SendMessagePayload) => void;
  onTypingStatus?: (typingStatus: TypingStatusPayload) => void;
  onDeleteMessage?: (deleteMessage: DeleteMessagePayload) => void;
  onError?: (error: ErrorPayload) => void;
  setIsLoading?: (loading: boolean) => void;
}) {
  useEffect(() => {
    if (!lastMessage) return;

    setIsLoading && setIsLoading(false);

    switch (lastMessage.type as MessageType) {
      case MessageType.ERROR:
        const errorPayload = lastMessage.payload as ErrorPayload;
        toast.error(errorPayload.details || errorPayload.error);
        onError?.(errorPayload);
        break;

      case MessageType.CHAT:
        switch (lastMessage.action) {
          case ChatEventType.READ:
            const readStatusPayload = lastMessage.payload as ReadStatusResult;
            onReadStatusUpdate?.(readStatusPayload);
            break;
          case ChatEventType.START_CONVERSATION:
            const startConversationPayload = lastMessage.payload as StartConversationPayload;
            onStartConversation?.(startConversationPayload);
            break;
          case ChatEventType.SENT:
            const sendMessagePayload = lastMessage.payload as SendMessagePayload;
            onSendMessage?.(sendMessagePayload);
            break;
          case ChatEventType.TYPING:
            const typingStatusPayload = lastMessage.payload as TypingStatusPayload;
            onTypingStatus?.(typingStatusPayload);
            break;
          case ChatEventType.DELETED:
            const deleteMessagePayload = lastMessage.payload as DeleteMessagePayload;
            onDeleteMessage?.(deleteMessagePayload);
            break;
          default:
            break;
        }
    }
  }, [
    lastMessage,
    onError,
    setIsLoading,
    onReadStatusUpdate,
    onStartConversation,
    onSendMessage,
    onTypingStatus,
    onDeleteMessage
  ]);
}
