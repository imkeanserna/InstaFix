"use client";

import { getConversations } from "@/lib/chatUtils";
import { ConversationWithRelations, CursorPagination } from "@repo/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReadStatusResult, useChatEventHandler } from "./useMessages";
import { useWebSocket } from "../useWebSocket";
import { toast } from "@repo/ui/components/ui/sonner";

export type ConversationsState = {
  conversations: ConversationWithRelations[];
  pagination: CursorPagination;
};

export const useConversations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationState, setConversationState] = useState<ConversationsState>({
    conversations: [],
    pagination: {
      hasNextPage: false,
      endCursor: undefined
    }
  });
  const { lastMessage, clearMessage } = useWebSocket();

  useChatEventHandler({
    lastMessage,
    onReadStatusUpdate: (result: ReadStatusResult) => {
      updateConversationUnreadCount(result.conversationId, result.messageIds);
      clearMessage();
    },
    onError: (errorPayload) => {
      toast.error(errorPayload.details || errorPayload.error);
      clearMessage();
    }
  })

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getConversations({
        take: 10
      });

      setConversationState({
        conversations: result.data.conversations,
        pagination: result.data.pagination
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const loadMore = useCallback(async () => {
    if (!conversationState.pagination.hasNextPage || isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await getConversations({
        cursor: conversationState.pagination.endCursor,
        take: 10
      });

      setConversationState(prev => ({
        conversations: [...prev.conversations, ...result.data.conversations],
        pagination: result.data.pagination
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more conversations');
    } finally {
      setIsLoading(false);
    }
  }, [conversationState.pagination.hasNextPage, conversationState.pagination.endCursor, isLoading]);

  const refresh = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  const addConversation = useCallback((conversation: ConversationWithRelations) => {
    setConversationState(prev => ({
      ...prev,
      conversations: [conversation, ...prev.conversations]
    }));
  }, []);

  const updateConversation = useCallback((updatedConversation: ConversationWithRelations) => {
    setConversationState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    }));
  }, []);

  const updateConversationUnreadCount = useCallback((conversationId: string, readMessageIds: string[]) => {
    setConversationState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: Math.max(0, conv.unreadCount - readMessageIds.length)
          };
        }
        return conv;
      })
    }));
  }, []);

  const removeConversation = useCallback((conversationId: string) => {
    setConversationState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(conv => conv.id !== conversationId)
    }));
  }, []);

  return useMemo(() => ({
    conversationState,
    isLoading,
    error,
    loadMore,
    refresh,
    addConversation,
    updateConversation,
    updateConversationUnreadCount,
    removeConversation,
    hasMore: conversationState.pagination.hasNextPage
  }), [
    conversationState,
    isLoading,
    error,
    loadMore,
    refresh,
    addConversation,
    updateConversation,
    updateConversationUnreadCount,
    removeConversation
  ]);
};
