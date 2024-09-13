import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface AuthState {
  jwtToken: string | null;
  setJwtToken: (token: string) => void;
  clearJwtToken: () => void;
}

const useAuthStore = create<AuthState>()(devtools(
  persist(
    (set) => ({
      jwtToken: null,
      setJwtToken: (token: string) => set({ jwtToken: token }),
      clearJwtToken: () => set({ jwtToken: null }),
    }),
    {
      name: 'auth-storage',
    }
  ),
  { name: 'AuthStore'}
)
);

useAuthStore.subscribe((state: unknown) => {
  console.log('State changed:', state);
});

export default useAuthStore;
