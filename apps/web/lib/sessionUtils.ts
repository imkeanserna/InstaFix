import { Location } from "@/components/ui/locationNavigation";

export const getSessionId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split('; ');
  const sessionIdCookie = cookies.find(cookie => cookie.startsWith('sessionId='));

  if (sessionIdCookie) {
    const value = sessionIdCookie.split('=')[1];
    return value;
  }
  return null;
};

export const getStoredLocation = (): Location | null => {
  const saved = localStorage.getItem('userLocation');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.lat && parsed.lng && parsed.address) {
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem('userLocation');
    }
  }
  return null;
};

type GetTokenResponse = {
  success: boolean;
  data: string;
  error?: string;
}

export const getToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GetTokenResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get response from chat AI');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}
