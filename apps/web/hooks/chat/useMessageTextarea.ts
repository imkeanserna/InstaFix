"use client";

import { validateFile } from "@repo/services/src/storage/mediaUpload";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasNotifiedTyping, setHasNotifiedTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setMessageText(newText);

    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

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

      // Stopped typing after 2 seconds of inactivity
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

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const errorMessage = validateFile(file);
      if (errorMessage) {
        setFileError(errorMessage);
      } else {
        setFileError(null);
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  }, []);

  const triggerImageSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeSelectedImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clean up image URL object if it exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return {
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
  };
}
