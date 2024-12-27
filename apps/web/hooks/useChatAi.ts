import { Message } from '@/components/chatbot/messageBubble';
import { useRef, useState } from 'react';

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}

interface UseChatOptions {
  onMessageSent?: () => void;
  onError?: (error: string) => void;
  externalErrorSetter?: (error: string) => void;
  initialMessages?: Message[];
}

export const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>(
    options.initialMessages || [
      { id: 1, role: 'bot', content: 'Hi there! How can I assist you today?' }
    ]
  );
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [internalError, setInternalError] = useState<string>('');

  const messageIdCounter = useRef(options.initialMessages?.length || 1);

  const handleError = (errorMessage: string) => {
    setInternalError(errorMessage);
    if (options.externalErrorSetter) {
      options.externalErrorSetter(errorMessage);
    }
    options.onError?.(errorMessage);
  };

  const clearError = () => {
    setInternalError('');
    if (options.externalErrorSetter) {
      options.externalErrorSetter('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    clearError();
  };

  const sendMessage = async (content: string) => {
    messageIdCounter.current += 1;
    const userMessage: Message = {
      id: messageIdCounter.current,
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMessage]);
    setIsBotTyping(true);
    clearError();

    try {
      const response = await fetch(`http://localhost:3000/api/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: content
        })
      });

      const result: ChatResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get response from chat AI');
      }

      messageIdCounter.current += 1;
      const botMessage: Message = {
        id: messageIdCounter.current,
        role: 'bot',
        content: result.data.message
      };

      setMessages(prev => [...prev, botMessage]);
      options.onMessageSent?.();

    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred';
      handleError(errorMessage);

      messageIdCounter.current += 1;
      const errorChatMessage: Message = {
        id: messageIdCounter.current,
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorChatMessage]);
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

  const clearChat = () => {
    setMessages(options.initialMessages || [
      { id: 1, role: 'bot', content: 'Hi there! How can I assist you today?' }
    ]);
    messageIdCounter.current = 1;
    clearError();
  };

  return {
    messages,
    input,
    isBotTyping,
    handleInputChange,
    handleSubmit,
    error: internalError,
    sendMessage,
    clearChat
  };
}
