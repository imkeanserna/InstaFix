"use client";

import { ConversationsState } from "@/hooks/chat/useConversations";
import { ConversationWithRelations } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { truncateText } from "../posts/post/expandibleDescription";
import { useRecoilState } from "recoil";
import { selectedConversationState } from "@repo/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingSpinnerMore } from "@repo/ui/components/ui/loading-spinner-more";
import { User } from "next-auth";
import { useDebounce } from "@/hooks/useDebounce";
import { Dialog, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Users as UsersIcon } from "lucide-react";
import ButtonCommingSoon from "../ui/buttonCommingSoon";

export function ConversationContent({
  conversationState,
  loadMore,
  hasMore,
  isLoadingMore,
  user,
  isMobile
}: {
  conversationState: ConversationsState;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  user: User;
  isMobile: boolean;
}) {
  return (
    <div className="flex flex-col overflow-auto">
      <div className="space-y-6 pt-0 pb-4 md:py-6 border-b px-6 border-b-gray-200 shadow-sm">
        <div className="justify-between items-center hidden md:flex">
          <p className="text-xl font-medium">Contacts</p>
          {conversationState.conversations.length > 0 &&
            <div className="text-yellow-600 flex justify-center items-center gap-1 rounded-xl bg-yellow-50 p-1">
              <UsersIcon className="w-4 h-4" />
              <p className="font-bold">{conversationState.conversations.length}</p>
            </div>
          }
        </div>
        <SearchEngineConversation>
          <ButtonCommingSoon />
        </SearchEngineConversation>
      </div>
      <div className="flex-1 overflow-y-auto h-full">
        <Conversations
          conversationState={conversationState}
          loadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          user={user}
        />
      </div>
    </div>
  );
}

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
            <div className="space-y-2 px-6 md:px-0">
              {conversationState.conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onSelect={handleConversationClick}
                  selected={selectedConversationId === conversation.id}
                  user={user}
                  isMobile
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
  user,
  isMobile
}: {
  conversation: ConversationWithRelations;
  onSelect: (id: string) => void;
  selected: boolean;
  user: User;
  isMobile: boolean;
}) {
  const timeSent = new Date(conversation.chatMessages[0].createdAt);
  const truncateTextValue = isMobile ? 30 : 50;

  const handleClick = () => {
    onSelect(conversation.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex gap-5 items-center w-full py-6 md:py-3 ps-0 md:ps-6 cursor-pointer hover:bg-gray-50 
        ${selected ? 'bg-gray-100 border-yellow-400 border-r-4' : 'border-b border-b-gray-200'}`
      }>
      <div className="relative">
        <Avatar className="h-16 w-16 md:h-14 md:w-14 shadow-md flex-shrink-0 rounded-full md:rounded-xl">
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
          <p className="capitalize font-bold md:font-normal">{conversation.participants[0].user.name}</p>
          {conversation.unreadCount > 0 &&
            (conversation.unreadCount === 1 ?
              <p className="bg-orange-100 text-gray-900 rounded-full px-2 py-1 text-sm">New</p>
              :
              <p className="bg-yellow-400 text-gray-900 rounded-full px-2 py-1 text-sm">{conversation.unreadCount}</p>)
          }
        </div>
        <div className="text-sm flex gap-3 justify-between text-gray-500">
          {conversation.chatMessages[0].image ? (
            <p className="w-[230px] md:w-[350px]">{`${conversation.chatMessages[0].senderId === user?.id ? 'You' : conversation.participants[0].user.name} sent an image`}</p>
          ) : (
            <p className="w-[230px] md:w-[350px]">{truncateText(conversation.chatMessages[0].body!, truncateTextValue)}</p>
          )}
          <p className="lowercase">{timeSent.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        </div>
      </div>
    </div >
  );
}

function SearchEngineConversation({
  children
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 300);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
    </Dialog>
  );
}
