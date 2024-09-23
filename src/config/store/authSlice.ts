import { create, StateCreator } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface Tokens {
  accessToken: string;
  accessTokenExp: string;
  refreshToken: string;
  refreshTokenExp: string;
}
interface AuthState {
  tokens: Tokens | null;
  setTokens: (tokens: { tokens: Tokens }) => void;
  clearTokens: () => void;
}

const createAuthStore: StateCreator<AuthState> = (set) => ({
  tokens: null,
  setTokens: (tokens) =>
      set(() => ({
          tokens: tokens.tokens,
      })),
  clearTokens: () => set(() => ({ tokens: null })),
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
