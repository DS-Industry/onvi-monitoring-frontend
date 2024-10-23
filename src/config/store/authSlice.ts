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
  posType: string;  
  startDate: string; 
  endDate: string;
  setTokens: (tokens: { tokens: Tokens }) => void;
  clearTokens: () => void;
  setPermissions: (permissions: Permission[]) => void;
  setPosType: (posType: string) => void;
  setStartDate: (startDate: string) => void; 
  setEndDate: (endDate: string) => void;
}

const today = new Date();
const formattedDate = today.toISOString().slice(0, 10);
const startDate = `${formattedDate} 00:00`;
const endDate = `${formattedDate} 23:59`;

const createAuthStore: StateCreator<AuthState> = (set) => ({
  tokens: null,
  permissions: [],
  posType: '',
  startDate: startDate,
  endDate: endDate,
  setTokens: (tokens) =>
      set(() => ({
          tokens: tokens.tokens,
      })),
  clearTokens: () => set(() => ({ tokens: null })),
  setPermissions: (permissions) => set({ permissions }),
  setPosType: (posType) => set({ posType }),
  setStartDate: (startDate) => set({ startDate }), 
  setEndDate: (endDate) => set({ endDate }), 
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
