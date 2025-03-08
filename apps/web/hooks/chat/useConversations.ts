"use client";

import { getConversations } from "@/lib/chatUtils";
import {
  ConversationWithRelations,
  CursorPagination,
  ChatMessageWithSender
} from "@repo/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReadStatusResult, useChatEventHandler } from "./useMessages";
import { useWebSocket } from "../useWebSocket";
import { toast } from "@repo/ui/components/ui/sonner";
import { useSession } from "next-auth/react";

export type ConversationsState = {
  conversations: ConversationWithRelations[];
  pagination: CursorPagination;
};

export const useConversations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
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
    onReadStatusUpdate: (readStatus: ReadStatusResult) => {
      updateConversationUnreadCount(readStatus.conversationId, readStatus.messageIds);
      clearMessage();
    },
    onSendMessage(sendMessage: ChatMessageWithSender) {
      setConversationState((prev: ConversationsState) => {
        // Update the specific conversation
        const updatedConversations = prev.conversations.map(conv => {
          if (conv.id === sendMessage.conversationId) {
            return {
              ...conv,
              lastMessageAt: sendMessage.createdAt,
              chatMessages: [sendMessage, ...(conv.chatMessages || [])],
              unreadCount: sendMessage.senderId !== session?.user?.id ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
              lastMessage: sendMessage
            };
          }
          return conv;
        });

        // Then sort conversations by lastMessageAt (newest first)
        const sortedConversations = [...updatedConversations].sort((a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

        return {
          ...prev,
          conversations: sortedConversations
        };
      });

      clearMessage();
    },
    onError: (errorPayload) => {
      toast.error(errorPayload.details || errorPayload.error);
      clearMessage();
    }
  });

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
      setIsLoadingMore(true);
      setError(null);
      const result = await getConversations({
        cursor: conversationState.pagination.endCursor,
        take: 15
      });

      setConversationState(prev => ({
        conversations: [...prev.conversations, ...result.data.conversations],
        pagination: result.data.pagination
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more conversations');
    } finally {
      setIsLoadingMore(false);
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
    isLoadingMore,
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
    isLoadingMore,
    error,
    loadMore,
    refresh,
    addConversation,
    updateConversation,
    updateConversationUnreadCount,
    removeConversation
  ]);
};
