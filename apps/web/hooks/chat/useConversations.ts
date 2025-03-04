"use client";

import { getConversations } from "@/lib/chatUtils";
import { ConversationWithRelations, CursorPagination } from "@repo/types";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
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
  };

  const loadMore = async () => {
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
  };

  const refresh = () => {
    fetchConversations();
  };

  const addConversation = (conversation: ConversationWithRelations) => {
    setConversationState(prev => ({
      ...prev,
      conversations: [conversation, ...prev.conversations]
    }));
  };

  const updateConversation = (updatedConversation: ConversationWithRelations) => {
    setConversationState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    }));
  };

  const removeConversation = (conversationId: string) => {
    setConversationState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(conv => conv.id !== conversationId)
    }));
  };

  return {
    conversationState,
    isLoading,
    error,
    loadMore,
    refresh,
    addConversation,
    updateConversation,
    removeConversation,
    hasMore: conversationState.pagination.hasNextPage
  };
};
