import { ChatContext } from '@/context/ChatProvider';
import { useContext } from 'react';

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
