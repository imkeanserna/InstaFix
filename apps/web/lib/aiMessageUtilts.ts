import { MessagesWithPosts } from '@repo/types';
import { Message } from '@prisma/client/edge';

type ReponseMessages = {
  success: boolean;
  data: Message[];
  error?: string;
}

export async function fetchMessages(sessionId: string, limit: number, offset: number) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/chat-ai?sessionId=${sessionId}&limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data: ReponseMessages = await response.json();
    if (data.success) {
      return data.data as MessagesWithPosts[];
    } else {
      const errorMessage = data.error || 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  } catch (error) {
    return [];
  }
}

type MessageResponse = {
  success: boolean;
  data: MessagesWithPosts | null;
  error?: string;
}

export async function fetchMessage(sessionId: string, messageId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/chat-ai?sessionId=${sessionId}&messageId=${messageId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data: MessageResponse = await response.json();
    if (data.success) {
      return data.data;
    } else {
      const errorMessage = data.error || 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  } catch (error) {
    return null;
  }
}

type ChatResponse = {
  success: boolean;
  data: {
    message: Message;
    shouldQuery: boolean;
  };
  error?: string;
}

export async function addMessage({ content }: { content: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/chat-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: content
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const result: ChatResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get response from chat AI');
    }
    return result.data;
  } catch (error) {
    return null;
  }
}
