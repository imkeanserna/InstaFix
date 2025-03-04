"use client";

import { getMessages } from "@/lib/chatUtils";
import { ChatMessageWithSender, CursorPagination } from "@repo/types";
import { useEffect, useState } from "react";

export type MessagesState = {
  messages: ChatMessageWithSender[];
  pagination: CursorPagination;
};

export const useMessages = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesState, setMessagesState] = useState<MessagesState>({
    messages: [],
    pagination: {
      hasNextPage: false,
      endCursor: undefined,
    },
  });

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMessages({ conversationId, take: 20 });
      setMessagesState({
        messages: result.data.messages,
        pagination: result.data.pagination,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
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
        pagination: result.data.pagination,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more messages");
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    fetchMessages();
  };

  const addMessage = (message: ChatMessageWithSender) => {
    setMessagesState((prev) => ({
      ...prev,
      messages: [message, ...prev.messages],
    }));
  };

  const updateMessage = (updatedMessage: ChatMessageWithSender) => {
    setMessagesState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      ),
    }));
  };

  const removeMessage = (messageId: string) => {
    setMessagesState((prev) => ({
      ...prev,
      messages: prev.messages.filter((msg) => msg.id !== messageId),
    }));
  };

  return {
    messagesState,
    isLoading,
    error,
    loadMore,
    refresh,
    addMessage,
    updateMessage,
    removeMessage,
    hasMore: messagesState.pagination.hasNextPage,
  };
}
