import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  jwtToken: string | null;
  setJwtToken: (token: string) => void;
  clearJwtToken: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      jwtToken: null,
      setJwtToken: (token: string) => set({ jwtToken: token }),
      clearJwtToken: () => set({ jwtToken: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
