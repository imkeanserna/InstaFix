import { atom } from 'recoil';

export const selectedConversationState = atom<string | null>({
  key: 'selectedConversationState',
  default: null
});
