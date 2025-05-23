"use client";

import { Suspense } from "react";
import { ConversationContent } from "./conversations";
import { Messages } from "./messages";
import { useRecoilValue } from "recoil";
import { selectedConversationState } from "@repo/store";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/chat/useConversations";
import { useSession } from "next-auth/react";
import { Button } from "@repo/ui/components/ui/button";
import { MessageCircleMore } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMedia";
import { AnimatePresence, motion } from "framer-motion";

export function ChatContent() {
  const selectedConversationId = useRecoilValue(selectedConversationState);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    conversationState,
    refresh,
    loadMore,
    hasMore,
    error,
    isLoading,
    isLoadingMore
  } = useConversations();

  const handleBookConversation = () => {
    router.push("/find");
  }

  if (isLoading || status === 'loading') {
    return <ChatContentSkeleton isMobile={isMobile} />;
  }

  if (!session?.user || !session?.user?.id) {
    router.back();
    return null;
  }

  if (error) {
    return <ConversationErrorBoundary error={error} refresh={refresh} />
  }

  return (
    <Suspense fallback={<ChatContentSkeleton isMobile={isMobile} />}>
      <div className="flex flex-col gap-4 h-screen p-0 md:py-6 md:px-12 bg-gray-200">
        {!isMobile &&
          <div className="flex justify-between items-center px-6">
            <p className="text-lg text-gray-900">Conversations with Instafix User</p>
            {selectedConversationId &&
              <Button
                onClick={handleBookConversation}
                className="flex items-center gap-2 px-8 rounded-xl bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98]"
              >
                <p className="text-sm">Book Freelancer</p>
              </Button>
            }
          </div>
        }
        <div className="flex justify-center items-center gap-6">
          <AnimatePresence mode="wait">
            {(isMobile && !selectedConversationId) && (
              <motion.div
                key="conversation-list"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  duration: 0.3
                }}
                className="w-full md:w-[540px] bg-white rounded-none md:rounded-3xl h-screen md:h-[90vh]"
              >
                <ConversationContent
                  conversationState={conversationState}
                  loadMore={loadMore}
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                  user={session.user}
                  isMobile={isMobile}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Non-mobile conversation list (always visible on desktop) */}
          {!isMobile && (
            <div className="hidden md:block w-full md:w-[540px] bg-white rounded-none md:rounded-3xl h-screen md:h-[90vh]">
              <ConversationContent
                conversationState={conversationState}
                loadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                user={session.user}
                isMobile={isMobile}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {(isMobile && selectedConversationId) || !isMobile ? (
              <motion.div
                key={selectedConversationId || 'no-conversation'}
                initial={isMobile ? { x: '100%', opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                exit={isMobile ? { x: '100%', opacity: 0 } : {}}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  duration: 0.3
                }}
                className="w-full md:w-2/3 bg-white h-screen md:h-[90vh] rounded-none md:rounded-3xl overflow-auto flex flex-col"
              >
                {selectedConversationId !== null
                  ?
                  <Messages
                    user={session.user}
                    conversationId={selectedConversationId}
                  />
                  :
                  <NoConversationSelected onClick={handleBookConversation} />
                }
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </Suspense>
  );
}

export function NoConversationSelected({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="w-36 h-36 mb-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-300">
        <MessageCircleMore className="w-16 h-16 text-gray-500 stroke-1 fill-gray-300" />
      </div>
      <h3 className="text-2xl font-medium text-gray-900 mb-4">Messages</h3>
      <div className="space-y-1 mb-8">
        <p className="text-gray-500 text-center text-sm">
          Click on a contact to view messages.
        </p>
        <p className="text-gray-400 text-center text-xs">
          To start a new conversation, you need to book a freelancer
        </p>
      </div>
      <Button
        onClick={onClick}
        className="flex items-center gap-2 py-6 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98]"
      >
        <MessageCircleMore className="w-7 h-7" />
        <p className="text-base">Book Freelancer</p>
      </Button>
    </div>
  );
}

export function ChatContentSkeleton({
  isMobile
}: {
  isMobile: boolean
}) {
  return (
    <div className="flex justify-center items-center gap-6 h-screen p-0 md:p-6 bg-gray-200">
      {/* Conversation list skeleton */}
      <div className="w-full md:w-[540px] bg-white h-screen md:h-[90vh] rounded-2xl flex flex-col">
        <div className="py-6 border-b px-6">
          <div className="h-14 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationsSkeleton numberOfSkeletons={isMobile ? 9 : 8} />
        </div>
      </div>
      {/* Messages area skeleton */}
      {!isMobile &&
        <div className="w-2/3 bg-white h-[90vh] rounded-2xl flex flex-col">
          <NoConversationSelectedSkeleton />
        </div>
      }
    </div>
  );
}

export function NoConversationSelectedSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="w-36 h-36 mb-10 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="space-y-2 mb-8 w-64">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6 mx-auto"></div>
      </div>
      <div className="h-14 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  );
}

export function ConversationErrorBoundary({
  error,
  refresh
}: {
  error: string,
  refresh: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Messages</h3>
      <p className="text-gray-500 text-center mb-4">
        {error || "There was an error loading the conversation."}
      </p>
      <div className="flex space-x-4">
        <Button onClick={() => refresh()} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function ConversationsSkeleton({ numberOfSkeletons = 8 }: { numberOfSkeletons?: number }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: numberOfSkeletons }).map((_, index) => (
        <ConversationCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ConversationCardSkeleton() {
  return (
    <div className="flex gap-5 w-full p-3 border-b border-gray-200 animate-pulse">
      {/* Avatar Skeleton */}
      <div className="h-14 w-14 bg-gray-300 rounded-xl"></div>

      {/* Message Details Skeleton */}
      <div className="space-y-2 w-full">
        {/* Name & Badge */}
        <div className="flex justify-between items-center">
          <div className="w-32 h-4 bg-gray-300 rounded"></div>
          <div className="w-12 h-5 bg-gray-200 rounded"></div>
        </div>

        {/* Message Preview & Time */}
        <div className="text-sm flex justify-between text-gray-500">
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="w-10 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

