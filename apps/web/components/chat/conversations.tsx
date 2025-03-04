"use client";

import { useConversations } from "@/hooks/chat/useConversations";
import { chatFormattedTime } from "@/lib/dateFormatters";
import { ConversationWithRelations } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { truncateText } from "../posts/post/expandibleDescription";

export function Conversations() {
  const router = useRouter();
  const { conversationState, addConversation, error, isLoading } = useConversations();
  const { data: session, status } = useSession();

  if (isLoading || error || status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user || !session?.user?.id) {
    router.back();
    return null;
  }

  return (
    <div className="w-full">
      {conversationState.conversations.length === 0 ? (
        <div>No Conversations</div>
      ) :
        (
          <div>
            {conversationState.conversations.map((conversation: ConversationWithRelations) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        )}
    </div>);
}

export function ConversationCard({
  conversation
}: {
  conversation: ConversationWithRelations
}) {
  const timeSent = new Date(conversation.chatMessages[0].createdAt);

  return (
    <div
      className={`flex gap-5 w-full p-3 border-b border-b-gray-200 cursor-pointer hover:bg-gray-50 ${conversation.unreadCount > 0 ? 'bg-gray-100 border-yellow-400 border-r-4 ' : ''}`}>
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
          <p className="w-[350px]">{truncateText(conversation.chatMessages[0].body!, 50)}</p>
          <p className="lowercase">{timeSent.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        </div>
      </div>
    </div>
  );
}
