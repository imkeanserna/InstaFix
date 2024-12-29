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
