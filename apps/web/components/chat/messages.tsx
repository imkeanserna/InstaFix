"use client";

import { useMessages } from "@/hooks/chat/useMessages";
import { chatFormattedTime, formatMessageDate, getFormattedTime } from "@/lib/dateFormatters";
import { ChatMessageWithSender } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

export function Messages({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { messagesState, addMessage, error, isLoading } = useMessages(conversationId);
  const { data: session, status } = useSession();

  if (!conversationId) {
    router.back();
    return null;
  }

  if (isLoading || error || status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user || !session?.user?.id) {
    router.back();
    return null;
  }

  console.log(messagesState);

  const groupedMessages = groupMessagesByDate(messagesState.messages);

  return (
    <div>
      <div className="w-full space-y-1 p-6">
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <React.Fragment key={date}>
            <DateSeparator date={date} />
            {messages.map((message: ChatMessageWithSender, index: number) =>
              message.isSystemMessage ? (
                <SystemMessage key={message.id} message={message} />
              ) : (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={message.senderId === session?.user?.id}
                  previousMessage={index > 0 ? messages[index - 1] : undefined}
                />
              )
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessageWithSender;
  isCurrentUser: boolean;
  previousMessage?: ChatMessageWithSender;
}

function MessageBubble({
  message,
  isCurrentUser,
  previousMessage
}: MessageBubbleProps) {
  // Function to check if messages are close in time (e.g., within 5 minutes)
  const isMessageCloseInTime = (currentMessage: ChatMessageWithSender, prevMessage?: ChatMessageWithSender) => {
    if (!prevMessage) return false;

    const timeDiff = new Date(currentMessage.createdAt).getTime() -
      new Date(prevMessage.createdAt).getTime();

    // Consider messages close if within 5 minutes (300,000 milliseconds)
    return timeDiff < 300000 &&
      currentMessage.senderId === prevMessage.senderId;
  };

  // Determine if timestamp should be shown
  const shouldShowTimestamp = !isMessageCloseInTime(message, previousMessage);

  return (
    <div className={`flex flex-col gap-1 items-start ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[70%] p-4 text-sm rounded-xl shadow-md 
        ${isCurrentUser
          ? 'bg-orange-200 text-gray-900 self-end rounded-br-none'
          : 'bg-blue-500 text-white rounded-bl-none'
        }
      `}>
        {message.body && <p>{message.body}</p>}
      </div>

      {shouldShowTimestamp && (
        <div className={`text-xs text-gray-500 my-2 ${isCurrentUser ? 'self-end' : 'self-start'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </div>
  );
}

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex justify-center">
      <p className="text-xs bg-gray-100 text-gray-900 py-2 px-3  rounded-xl">
        {date}
      </p>
    </div>
  );
}

function SystemMessage({ message }: { message: ChatMessageWithSender }) {
  return (
    <div className="flex flex-col gap-3 justify-center items-center p-4">
      <div className="flex items-center gap-6 w-full">
        <div className="flex-1 h-[1px] bg-gray-300 rounded-full"></div>
        <p className="text-xs text-gray-500 whitespace-nowrap">{getFormattedTime(new Date(message.createdAt))}</p>
        <div className="flex-1 h-[1px] bg-gray-300 rounded-full"></div>
      </div>
      <p className="p-4 text-gray-500 rounded-lg text-sm">{message.body}</p>
    </div>
  );
}

function groupMessagesByDate(messages: ChatMessageWithSender[]) {
  return messages.reduce((acc, message) => {
    const messageDate = formatMessageDate(new Date(message.createdAt));

    if (!acc[messageDate]) {
      acc[messageDate] = [];
    }

    acc[messageDate].push(message);

    return acc;
  }, {} as Record<string, ChatMessageWithSender[]>);
}
