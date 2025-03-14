'use client';

import { createContext, useEffect, useState } from 'react';
import { getSessionId } from '@/lib/sessionUtils';
import { addMessage, fetchMessage, fetchMessages } from '@/lib/aiMessageUtilts';
import { Message, Role, Status } from '@prisma/client/edge';
import { v4 as uuidv4 } from 'uuid';
import { MessagePostWithPost, MessagesWithPosts } from '@repo/types';

interface IChatContextType {
  sessionId: string | null;
  messages: Message[];
  messagePostsMap: Record<string, MessagePostWithPost[]>;
  input: string;
  isBotTyping: boolean;
  isLoadingMore: boolean;
  error: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleScroll: () => void;
  clearChat: () => void;
  clearError: () => void;
}

export const ChatContext = createContext<IChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
  onMessageSent?: () => void;
  onError?: (error: string) => void;
  externalErrorSetter?: (error: string) => void;
}

export function ChatProvider({
  children,
  onMessageSent,
  onError,
  externalErrorSetter,
}: ChatProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [messagePostsMap, setMessagePostsMap] = useState<Record<string, MessagePostWithPost[]>>({});

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    if (externalErrorSetter) {
      externalErrorSetter(errorMessage);
    }
    onError?.(errorMessage);
  };

  const clearError = () => {
    setError('');
    if (externalErrorSetter) {
      externalErrorSetter('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    clearError();
  };

  const sendMessage = async (content: string) => {
    setIsBotTyping(true);
    clearError();

    const userMessage: Message = {
      id: uuidv4(),
      chatSessionId: sessionId || '',
      role: Role.USER,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: Status.SENT,
      errorCode: null
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      const response: { message: Message; shouldQuery: boolean } | null = await addMessage({ content });

      if (response?.message == null) {
        throw new Error('Failed to fetch messages');
      }

      setMessages(prevMessages => [...prevMessages, response.message]);
      onMessageSent?.();
      if (response?.shouldQuery) {
        const message: MessagesWithPosts | null = await fetchMessage(response.message.chatSessionId, response.message.id);
        if (message) {
          setMessagePostsMap(prev => ({
            ...prev,
            [response.message.id]: message.messagePosts
          }));
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred';
      const errorChatMessage: Message = {
        id: uuidv4(),
        chatSessionId: sessionId || '',
        role: Role.BOT,
        content: 'Sorry! Something went wrong in my head. Could we try that again? 🥺',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: Status.SENT,
        errorCode: null
      }
      setMessages(prev => [...prev, errorChatMessage]);
      handleError(errorMessage);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    setInput('');
    await sendMessage(trimmedInput);
  };

  const clearChat = async () => {
    try {
      const currentSessionId = sessionId;
      if (!currentSessionId) return;

      await fetch(`${process.env.NEXT_BACKEND_URL}/api/messages/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: currentSessionId })
      });

      setMessages([]);
      clearError();
    } catch (error) {
      handleError('Failed to clear chat');
    }
  };

  const handleScroll = async () => {
    if (!isLoadingMore) {
      setIsLoadingMore(true);
      const newOffset = offset + limit;
      try {
        const olderMessages: MessagesWithPosts[] = await fetchMessages(sessionId || '', limit, newOffset);
        if (olderMessages && olderMessages.length > 0) {
          setMessages(prevMessages => [...olderMessages, ...prevMessages]);
          olderMessages.forEach((oldMessage: MessagesWithPosts) => {
            if (oldMessage.messagePosts && oldMessage.messagePosts.length > 0) {
              setMessagePostsMap(prev => ({
                ...prev,
                [oldMessage.id]: oldMessage.messagePosts
              }));
            }
          });
          setOffset(newOffset);
        }
      } catch (error) {
        console.error('Failed to load more messages:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    const loadInitialMessages = async () => {
      const currentSessionId = getSessionId();
      if (currentSessionId) {
        setSessionId(currentSessionId);
        try {
          const messages: MessagesWithPosts[] = await fetchMessages(currentSessionId, limit, offset);
          if (messages && messages?.length > 0) {
            setMessages(messages);
            const newMessagePostsMap: Record<string, MessagePostWithPost[]> = {};
            messages.forEach((message: MessagesWithPosts) => {
              if (message.messagePosts && message.messagePosts.length > 0) {
                newMessagePostsMap[message.id] = message.messagePosts;
              }
            });
            setMessagePostsMap(newMessagePostsMap);
          } else {
            const initialMessage: Message = {
              id: uuidv4(),
              chatSessionId: currentSessionId,
              role: Role.BOT,
              content: 'Hi there! How can I help you today?',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: Status.SENT,
              errorCode: null
            }
            setMessages([initialMessage]);
          }
        } catch (error) {
          handleError('Failed to load messages');
        }
      }
    };

    loadInitialMessages();
  }, []);

  const contextValue: IChatContextType = {
    sessionId,
    messages,
    messagePostsMap,
    input,
    isBotTyping,
    isLoadingMore,
    error,
    handleInputChange,
    handleSubmit,
    handleScroll,
    clearChat,
    clearError
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}
