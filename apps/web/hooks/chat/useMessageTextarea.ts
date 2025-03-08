"use client";

import { MessageType, TypingStatus, TypingStatusPayload } from "@repo/types";
import { User } from "next-auth";
import { useCallback, useEffect, useRef, useState } from "react";


interface UseMessageTextareaProps {
  conversationId: string;
  user: User | undefined;
  sendTypingStatus: (type: MessageType, data: TypingStatusPayload) => void;
}

export function useMessageTextarea({
  conversationId,
  user,
  sendTypingStatus
}: UseMessageTextareaProps) {
  const [messageText, setMessageText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasNotifiedTyping, setHasNotifiedTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setMessageText(newText);

    // Send typing status
    if (newText.trim() && user?.id) {
      if (!hasNotifiedTyping) {
        sendTypingStatus(MessageType.CHAT, {
          conversationId,
          status: "TYPING" as TypingStatus
        });

        setHasNotifiedTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send stopped typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(MessageType.CHAT, {
          conversationId,
          status: "STOPPED_TYPING" as TypingStatus
        });

        // Reset the flag when typing stops
        setHasNotifiedTyping(false);
      }, 2000);
    }
  }, [conversationId, user, sendTypingStatus, hasNotifiedTyping]);

  const clearMessageText = useCallback(() => {
    setMessageText('');

    // Focus the textarea again
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (hasNotifiedTyping) {
      sendTypingStatus(MessageType.CHAT, {
        conversationId,
        status: "STOPPED_TYPING" as TypingStatus
      });
      setHasNotifiedTyping(false);
    }
  }, [conversationId, sendTypingStatus, hasNotifiedTyping]);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messageText,
    textareaRef,
    handleTextChange,
    clearMessageText,
    stopTyping
  };
}
