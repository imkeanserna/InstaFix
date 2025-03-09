"use client";

import { ConversationsState } from "@/hooks/chat/useConversations";
import { ConversationWithRelations } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { truncateText } from "../posts/post/expandibleDescription";
import { useRecoilState } from "recoil";
import { selectedConversationState } from "@repo/store";
import { useCallback, useEffect, useRef } from "react";
import { LoadingSpinnerMore } from "@repo/ui/components/ui/loading-spinner-more";
import { User } from "next-auth";

export function Conversations({
  conversationState,
  loadMore,
  hasMore,
  isLoadingMore,
  user
}: {
  conversationState: ConversationsState;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  user: User;
}) {
  const [selectedConversationId, setSelectedConversationId] = useRecoilState(selectedConversationState);

  // Ref for the sentinel element (for infinite scrolling)
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scrolling
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // Connect observer when component mounts or when dependencies change
  useEffect(() => {
    setupObserver();
    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupObserver, conversationState.conversations.length]);

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="w-full overflow-y-auto">
      {conversationState.conversations.length === 0 ? (
        <div className="text-center p-4">No Conversations</div>
      ) :
        (
          <>
            <div className="space-y-2">
              {conversationState.conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onSelect={handleConversationClick}
                  selected={selectedConversationId === conversation.id}
                  user={user}
                />
              ))}
            </div>
            <div
              ref={loadMoreRef}
              className="h-10 w-full flex justify-center items-center py-6"
            >
              {isLoadingMore ? (
                <LoadingSpinnerMore className="w-6 h-6" />
              ) : hasMore ? (
                <div className="h-4"></div>
              ) : (
                <div className="text-sm text-gray-500">No more conversations</div>
              )}
            </div>
          </>
        )}
    </div>);
}

export function ConversationCard({
  conversation,
  onSelect,
  selected,
  user
}: {
  conversation: ConversationWithRelations;
  onSelect: (id: string) => void;
  selected: boolean;
  user: User;
}) {
  const timeSent = new Date(conversation.chatMessages[0].createdAt);

  const handleClick = () => {
    onSelect(conversation.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex gap-5 w-full py-3 ps-6 cursor-pointer hover:bg-gray-50 
        ${selected ? 'bg-gray-100 border-yellow-400 border-r-4' : 'border-b border-b-gray-200'}`
      }>
      <div className="relative">
        <Avatar className="h-14 w-14 shadow-md flex-shrink-0 rounded-xl">
          <AvatarImage
            src={conversation.participants[0].user.image!}
            alt={`${conversation.participants[0].user.name}'s avatar`}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-amber-200 to-yellow-300 text-amber-800 text-2xl font-medium">
            {conversation.participants[0].user.name}
          </AvatarFallback>
          <div className="absolute inset-0 rounded-xl"></div>
        </Avatar>
        {conversation.unreadCount > 0 && <div className="absolute right-0 top-0 h-3 w-3 bg-yellow-500 rounded-full bottom-0 border border-white"></div>}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="capitalize">{conversation.participants[0].user.name}</p>
          {conversation.unreadCount > 0 &&
            (conversation.unreadCount === 1 ?
              <p className="bg-orange-100 text-gray-900 rounded-full px-2 py-1 text-sm">New</p>
              :
              <p className="bg-yellow-400 text-gray-900 rounded-full px-2 py-1 text-sm">{conversation.unreadCount}</p>)
          }
        </div>
        <div className="text-sm flex gap-3 justify-between text-gray-500">
          {conversation.chatMessages[0].image ? (
            <p className="w-[350px]">{`${conversation.chatMessages[0].senderId === user?.id ? 'You' : conversation.participants[0].user.name} sent an image`}</p>
          ) : (
            <p className="w-[350px]">{truncateText(conversation.chatMessages[0].body!, 50)}</p>
          )}
          <p className="lowercase">{timeSent.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        </div>
      </div>
    </div >
  );
}
