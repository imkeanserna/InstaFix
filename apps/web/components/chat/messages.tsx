"use client";

import { useMessages, useMessagesActions, } from "@/hooks/chat/useMessages";
import { chatFormattedTime, formatMessageDate, getFormattedTime } from "@/lib/dateFormatters";
import { ChatMessageWithSender, MessageType, sendMessageSchema } from "@repo/types";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { DotTypingLoading } from "@repo/ui/components/ui/dot-typing-loading";
import { useMessageTextarea } from "@/hooks/chat/useMessageTextarea";
import { CheckIcon, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@repo/ui/components/ui/sonner";
import { ConversationErrorBoundary } from "./chatContent";
import { Button } from "@repo/ui/components/ui/button";
import { User } from "next-auth";
import Image from "next/image";
import { Media } from "@prisma/client/edge";
import { SingleImageModal } from "../posts/post/postGallery";
import { fileToBase64 } from "@/lib/uploadFiles";

export function Messages({
  conversationId,
  user
}: {
  conversationId: string;
  user: User | undefined;
}) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const {
    messagesState,
    addMessage,
    refresh,
    loadMore,
    hasMore,
    error,
    isLoading,
    isTyping,
    isLoadingMore,
    isNewMessage,
    resetNewMessageFlag
  } = useMessages(conversationId);
  const { sendMessage } = useWebSocket();
  const { sendTextMessage, sendTypingStatus } = useMessagesActions(sendMessage);
  const [selectedFileImage, setSelectedFileImage] = useState<Media | null>(null);

  const {
    messageText,
    textareaRef,
    fileInputRef,
    selectedImage,
    imagePreview,
    fileError,
    handleTextChange,
    handleImageSelect,
    triggerImageSelect,
    removeSelectedImage,
    clearMessageText,
    stopTyping
  } = useMessageTextarea({
    conversationId,
    user: user,
    sendTypingStatus
  });

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesState.messages.length > 0) {
      scrollToBottom();
    }
    resetNewMessageFlag();
  }, [scrollToBottom, isNewMessage]);

  const handleCloseModal = useCallback(() => {
    setSelectedFileImage(null);
  }, []);

  const handleSetSelectedImage = useCallback((image: string) => {
    setSelectedFileImage({ url: image } as Media);
  }, []);

  // Function to load more messages with scroll position maintenance
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    // Store current scroll height before loading more messages
    const currentHeight = messagesContainerRef.current?.scrollHeight || 0;

    await loadMore();

    // After messages are loaded, adjust scroll position
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        const newHeight = messagesContainerRef.current.scrollHeight;
        messagesContainerRef.current.scrollTop = newHeight - currentHeight;
      }
    });
  }, [hasMore, isLoadingMore, loadMore]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadTriggerRef.current) {
      observer.observe(loadTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, handleLoadMore]);

  const handleSendMessage = useCallback(async () => {
    if ((!messageText.trim() && !selectedImage) || !user || user?.id === undefined) return;

    try {
      let imageBase64 = undefined;
      if (selectedImage) {
        imageBase64 = await fileToBase64(selectedImage);
      }

      const validatedData = sendMessageSchema.parse({
        conversationId,
        body: messageText.trim() || undefined,
        files: imageBase64 ? [imageBase64] : undefined,
      });

      // Create a new message object
      const newMessage: ChatMessageWithSender = {
        id: crypto.randomUUID(),
        conversationId: validatedData.conversationId,
        senderId: user?.id,
        body: validatedData.body || null,
        image: imageBase64 || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isRead: false,
        bookingId: null,
        isSystemMessage: false,
        sender: {
          id: user?.id,
          name: user?.name,
          image: user?.image,
        }
      };

      stopTyping();
      addMessage(newMessage);
      sendTextMessage(MessageType.CHAT, {
        conversationId: validatedData.conversationId,
        body: validatedData.body,
        files: selectedImage ? [selectedImage] : undefined,
      });
      clearMessageText();
      removeSelectedImage();

      // Scroll to bottom after sending a message
      setTimeout(scrollToBottom, 0);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send message');
    }
  }, [
    messageText,
    selectedImage,
    conversationId,
    user,
    addMessage,
    sendTextMessage,
    stopTyping,
    clearMessageText,
    removeSelectedImage,
    scrollToBottom
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId) {
    return null;
  }

  if (isLoading || messagesState.participants.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex gap-4 border-b shadow-sm border-b-gray-200 px-6 py-4">
          <div className="h-14 w-14 rounded-xl bg-gray-200 animate-pulse"></div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MessageSkeletonGroup />
        </div>

        <div className="px-8 py-4 bg-white">
          <div className="flex items-end gap-2 relative">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ConversationErrorBoundary error={error} refresh={refresh} />
  }

  const groupedMessages = groupMessagesByDate(messagesState.messages);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 border-b shadow-sm border-b-gray-200 px-6 py-4">
        <Avatar className="h-14 w-14 shadow-md flex-shrink-0 rounded-xl">
          <AvatarImage
            src={messagesState.participants[0].image!}
            alt={`${messagesState.participants[0].name}'s avatar`}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-amber-200 to-yellow-300 text-amber-800 text-2xl font-medium">
            {messagesState.participants[0].name}
          </AvatarFallback>
          <div className="absolute inset-0 rounded-xl"></div>
        </Avatar>
        <div className="space-y-1">
          <p className="capitalize text-sm font-medium">{messagesState.participants[0].name}</p>
          <div className="flex gap-2 justify-center items-center">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <p className="text-xs text-gray-600">Joined {chatFormattedTime(new Date(messagesState.participants[0].createdAt))}</p>
          </div>
        </div>
      </div>
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-8 py-4 space-y-1">
        {/* Loading trigger at the top */}
        <div ref={loadTriggerRef} className="mb-2">
          {isLoadingMore && hasMore && (
            <div className="py-2 space-y-3">
              <MessageSkeleton includeImage={true} />
              <MessageSkeleton isCurrentUser={true} />
            </div>
          )}
        </div>

        {/* No more messages indicator */}
        {!hasMore && (
          <div className="text-center text-sm text-gray-500 py-2">No more messages to load</div>
        )}

        {Object.entries(groupedMessages).map(([date, messages]) => (
          <React.Fragment key={date}>
            <DateSeparator date={date} />
            <AnimatePresence initial={false}>
              {messages.map((message: ChatMessageWithSender, index: number) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.isSystemMessage ? (
                    <SystemMessage message={message} />
                  ) : (
                    <MessageBubble
                      message={message}
                      isCurrentUser={message.senderId === user?.id}
                      nextMessage={index < messages.length - 1 ? messages[index + 1] : undefined}
                      setSelectedImage={handleSetSelectedImage}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </React.Fragment>
        ))}
      </div>
      {/* Message input area */}
      <div className="px-8 bg-white mb-2">
        <div className="border border-gray-200 p-2 rounded-xl focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-transparent">
          {fileError && (
            <div className="mb-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
              {fileError}
            </div>
          )}
          {imagePreview && (
            <div className="relative mb-2 inline-block">
              <Image
                src={imagePreview}
                alt={`Selected`}
                width={60}
                height={20}
                className="h-20 rounded-lg object-cover"
              />
              <button
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-white"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-end justify-end gap-1 relative">
            <Button
              onClick={triggerImageSelect}
              className="text-gray-500 bg-yellow-100 hover:bg-yellow-200 px-3 py-2 rounded-xl active:scale-95"
              title="Add image"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 resize-none min-h-[40px] max-h-[120px] py-2 px-3 focus:outline-none rounded-lg"
              rows={1}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() && !selectedImage}
              className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 active:scale-[0.98]"
            >
              <p className="text-sm text-gray-700">Send</p>
              <div className="rotate-45">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </Button>
          </div>
        </div>
      </div>
      <div className="ps-10 pb-4">
        {isTyping && <TypingIndicator name={messagesState.participants[0].name!} />}
      </div>
      {selectedFileImage && (
        <SingleImageModal
          image={selectedFileImage}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessageWithSender;
  isCurrentUser: boolean;
  nextMessage?: ChatMessageWithSender;
  setSelectedImage: (image: string) => void;
}

function MessageBubble({
  message,
  isCurrentUser,
  nextMessage,
  setSelectedImage
}: MessageBubbleProps) {
  // Determine if messages are close in time (within 3 minutes)
  const isCloseInTime = (msg1: ChatMessageWithSender, msg2?: ChatMessageWithSender) => {
    if (!msg2) return false;
    const timeDiff = Math.abs(
      new Date(msg1.createdAt).getTime() - new Date(msg2.createdAt).getTime()
    );
    return timeDiff < 3 * 60 * 1000 && // 3 minutes
      msg1.senderId === msg2.senderId;
  };

  // Show timestamp if this is the last message in a time group
  const isLastInTimeGroup = !nextMessage || !isCloseInTime(message, nextMessage);
  const shouldShowTimestamp = isLastInTimeGroup;

  // Render read status indicator for current user's messages
  const renderReadStatus = () => {
    if (!isCurrentUser) return null;

    return (
      <div className="flex items-center justify-end text-xs text-gray-500 mt-1 mr-1">
        {message.isRead ? (
          <div className="w-4 h-4 bg-orange-200 rounded-full flex justify-center items-center font-bold">
            <CheckIcon className="h-3 w-3 text-gray-900" strokeWidth={4} />
          </div>
        ) : (
          <div className="w-4 h-4 bg-gray-200 rounded-full flex justify-center items-center font-bold">
            <CheckIcon className="h-3 w-3 text-gray-300" strokeWidth={4} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col gap-1 items-start ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[70%] text-sm rounded-xl shadow-md 
        ${message.image ? 'py-1 px-3' : 'p-4'}
        ${isCurrentUser
          ? 'bg-orange-200 text-gray-900 self-end rounded-br-none'
          : 'bg-blue-500 text-white rounded-bl-none'
        }
      `}>
        {/* Message image content */}
        {message.image && (
          <div
            onClick={() => setSelectedImage(message.image!)}
            className={`relative mb-${message.body ? "2" : "0"} -mx-2 cursor-pointer hover:opacity-[0.97]`}
          >
            <Image
              src={message.image}
              alt={`Message attachment ${message.sender.name!}`}
              width={150}
              height={150}
              className="rounded-xl h-auto w-64 object-cover max-h-64"
            />
            <div className="absolute inset-0 rounded-xl"></div>
          </div>
        )}
        {message.body && <p>{message.body}</p>}
      </div>
      <div className={`flex gap-2 items-center ${isCurrentUser ? 'self-end' : 'self-start'}`}>
        {shouldShowTimestamp && (
          <>
            <div className="text-xs text-gray-500 my-2">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {renderReadStatus()}
          </>
        )}
      </div>
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
    <div className="flex flex-col gap-3 justify-center items-center py-4">
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

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex gap-2">
      <DotTypingLoading />
      <div className="animate-pulse flex gap-1">
        <p className="text-sm text-gray-900 font-bold">{name}</p>
        <p className="text-sm text-gray-600 font-semibold "> is typing...</p>
      </div>
    </div>
  );
}

interface MessageSkeletonProps {
  isCurrentUser?: boolean;
  includeImage?: boolean;
  isLast?: boolean;
}

export const MessageSkeleton = ({
  isCurrentUser = false,
  includeImage = false,
  isLast = false
}: MessageSkeletonProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2 ${!isLast ? 'mb-4' : ''}`}>
      <div
        className={`
          flex flex-col gap-1
          ${isCurrentUser
            ? 'items-end'
            : 'items-start'}
        `}
      >
        <div
          className={`
            rounded-xl p-3 
            ${isCurrentUser
              ? 'bg-gray-200 rounded-br-none'
              : 'bg-gray-200 rounded-bl-none'}
            animate-pulse
            ${includeImage ? 'w-52' : 'w-64'}
            ${includeImage ? 'h-64' : 'h-12'}
          `}
        ></div>
        <div className="flex items-center gap-1">
          <div className={`
            ${isCurrentUser
              ? 'bg-gray-200 rounded-br-none'
              : 'bg-gray-200 rounded-bl-none'}
              h-12 w-40 bg-gray-200 rounded-xl animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
};

export const MessageSkeletonGroup = () => {
  return (
    <div className="space-y-4 px-6 py-4">
      <MessageSkeleton isCurrentUser={true} />
      <MessageSkeleton includeImage={true} />
      <MessageSkeleton isCurrentUser={true} />
      <MessageSkeleton isCurrentUser={true} />
    </div>
  );
};
