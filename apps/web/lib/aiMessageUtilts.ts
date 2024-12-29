import { Message } from '@prisma/client/edge';

export interface IReponseMessages {
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

    const data: IReponseMessages = await response.json();
    if (data.success) {
      return data.data;
    } else {
      const errorMessage = data.error || 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  } catch (error) {
    return [];
  }
}
