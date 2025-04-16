import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist({
  key: 'sidebarOpen',
  storage: localStorage,
});

export const sidebarOpenState = atom({
  key: 'sidebarOpenState',
  default: true,
  effects_UNSTABLE: [persistAtom],
});
