import { create, StateCreator } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface Tokens {
  accessToken: string;
  accessTokenExp: string;
  refreshToken: string;
  refreshTokenExp: string;
}

type Permission = {
  object: string;
  action: string;
};
interface AuthState {
  tokens: Tokens | null;
  permissions: Permission[];
  setTokens: (tokens: { tokens: Tokens }) => void;
  clearTokens: () => void;
  setPermissions: (permissions: Permission[]) => void;
}

const createAuthStore: StateCreator<AuthState> = (set) => ({
  tokens: null,
  permissions: [],
  setTokens: (tokens) =>
      set(() => ({
          tokens: tokens.tokens,
      })),
  clearTokens: () => set(() => ({ tokens: null })),
  setPermissions: (permissions) => set({ permissions }),
});

const useAuthStore = create<AuthState>()(
  devtools(
      persist(createAuthStore, {
          name: 'auth-storage', 
      }),
      { name: 'AuthStore' }
  )
);

useAuthStore.subscribe((state: unknown) => {
  console.log('State changed:', state);
});

export default useAuthStore;
