import { GetConversationsResult, GetMessagesResult } from "@repo/types";

export type GetConversationsResponse = {
  success: boolean;
  data: GetConversationsResult;
  error?: string;
}

export async function getConversations({
  cursor,
  take
}: {
  cursor?: string | null;
  take: number;
}) {
  const queryParams = new URLSearchParams();
  queryParams.append("take", String(take));

  if (cursor) {
    queryParams.append("cursor", cursor);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/conversations?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetConversationsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch conversations');
    }

    return {
      data: result.data,
      nextCursor: result.data.conversations.length > 0 ? result.data.pagination?.endCursor : undefined
    };
  } catch (error) {
    console.error('Error in getting conversations:', error);
    clearTimeout(timeout);
    return {
      data: {
        conversations: [],
        pagination: {
          hasNextPage: false,
        }
      },
      nextCursor: undefined
    };
  }
}

export type GetMessagesResponse = {
  success: boolean;
  data: GetMessagesResult;
  error?: string;
}

export async function getMessages({
  conversationId,
  cursor,
  take
}: {
  conversationId: string;
  cursor?: string | null;
  take: number;
}) {
  const queryParams = new URLSearchParams();
  queryParams.append("take", String(take));

  if (cursor) {
    queryParams.append("cursor", cursor);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    if (!conversationId) {
      throw new Error('Conversation Id is required');
    }

    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/conversations/${conversationId}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetMessagesResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch messages');
    }

    return {
      data: result.data,
      nextCursor: result.data.messages.length > 0 ? result.data.pagination?.endCursor : undefined
    };
  } catch (error) {
    console.error('Error in getting messages:', error);
    clearTimeout(timeout);
    return {
      data: {
        messages: [],
        pagination: {
          hasNextPage: false,
        }
      },
      nextCursor: undefined
    };
  }
}
