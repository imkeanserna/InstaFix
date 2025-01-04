import { atom } from 'recoil';

interface ValidationState {
  [key: string]: boolean;
}

export const validationStateAtom = atom<ValidationState>({
  key: 'validationState',
  default: {},
});
