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
  PostMedia,
  ReadStatusPayload,
  StartConversationPayload,
  TypingStatus,
  TypingStatusPayload
} from "@repo/types";
import { toast } from "@repo/ui/components/ui/sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWebSocket } from "../useWebSocket";
import { uploadFiles } from "@/lib/uploadFiles";

export const useMessages = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isNewMessage, setIsNewMessage] = useState(false);
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
  const { lastMessage, clearMessage } = useWebSocket();
  const { sendReadStatus } = useMessagesActions(sendMessage);

  useChatEventHandler({
    lastMessage,
    onSendMessage(sendMessage: ChatMessageWithSender) {
      setIsNewMessage(true);
      addMessage(sendMessage);
      clearMessage();
    },
    onTypingStatus(typingStatus: TypingStatusResult) {
      if (typingStatus.status === "TYPING" as TypingStatus && typingStatus.conversationId === conversationId) {
        setIsTyping(true);
      } else if (typingStatus.status === "STOPPED_TYPING" as TypingStatus && typingStatus.conversationId === conversationId) {
        setIsTyping(false);
      }
      sendReadStatus(MessageType.CHAT, { conversationId });
      clearMessage();
    },
    onReadStatusUpdate: (readStatus: ReadStatusResult) => {
      if (readStatus.conversationId === conversationId) {
        markMessagesAsRead();
      }
      clearMessage();
    },
    onError: (errorPayload) => {
      toast.error(errorPayload.details || errorPayload.error);
      clearMessage();
    }
  });

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

      if (conversationId && result.data.unreadCount > 0) {
        sendReadStatus(MessageType.CHAT, { conversationId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  const loadMore = useCallback(async () => {
    if (!messagesState.pagination.hasNextPage || isLoading) return;
    try {
      setIsLoadingMore(true);
      setError(null);
      const result = await getMessages({
        conversationId,
        cursor: messagesState.pagination.endCursor,
        take: 20,
      });
      setMessagesState((prev) => ({
        messages: [...result.data.messages, ...prev.messages],
        participants: result.data.participants,
        unreadCount: result.data.unreadCount,
        pagination: result.data.pagination,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more messages");
    } finally {
      setIsLoadingMore(false);
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
      messages: [...prev.messages, message],
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

  const markMessagesAsRead = useCallback(() => {
    setMessagesState((prev) => {
      const updatedMessages = prev.messages.map(msg => {
        return { ...msg, isRead: true };
      });

      return {
        ...prev,
        messages: updatedMessages,
        unreadCount: 0
      };
    });
  }, []);

  const resetNewMessageFlag = useCallback(() => {
    setIsNewMessage(false);
  }, []);

  return useMemo(() => ({
    messagesState,
    isLoading,
    isLoadingMore,
    isTyping,
    isNewMessage,
    error,
    loadMore,
    refresh,
    addMessage,
    updateMessage,
    removeMessage,
    resetNewMessageFlag,
    hasMore: messagesState.pagination.hasNextPage
  }), [
    messagesState,
    isLoading,
    isLoadingMore,
    isTyping,
    isNewMessage,
    error,
    loadMore,
    refresh,
    addMessage,
    updateMessage,
    removeMessage,
    resetNewMessageFlag
  ]);
}

export function useMessagesActions(sendMessage: Function) {
  const { isConnected } = useWebSocket();
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
    async (event: MessageType, data: {
      conversationId: string;
      body?: string;
      files?: File[];
    }) => {
      let fileUrls: PostMedia[] = [];

      if (data.files && data.files?.length > 0 && isConnected) {
        const result = await uploadFiles(data.files);
        fileUrls = result.files;
      }

      const payload = {
        type: ChatEventType.SENT,
        payload: {
          conversationId: data.conversationId,
          body: data.body,
          files: fileUrls
        }
      }
      sendMessage(event, payload);
    },
    [sendMessage, isConnected]
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
    deleteMessage
  }
}

export type ReadStatusResult = {
  conversationId: string;
  userId?: string;
  messageIds: string[];
  timestamp?: Date;
}

export type TypingStatusResult = {
  conversationId: string;
  userId: string;
  status: TypingStatus;
  timestamp: Date;
};

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
  onSendMessage?: (sendMessage: ChatMessageWithSender) => void;
  onTypingStatus?: (typingStatus: TypingStatusResult) => void;
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
            const sendMessagePayload = lastMessage.payload as ChatMessageWithSender;
            onSendMessage?.(sendMessagePayload);
            break;
          case ChatEventType.STOPPED_TYPING:
          case ChatEventType.TYPING:
            const typingStatusPayload = lastMessage.payload as TypingStatusResult;
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
