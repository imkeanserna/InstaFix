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
