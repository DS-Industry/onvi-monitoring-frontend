import { create, StateCreator } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type Permission = {
  subject: string;
  action: string;
};
interface AuthState {
  isAuthenticated: boolean;
  permissions: Permission[];
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
  setPermissions: (permissions: Permission[]) => void;
  clearPermissions: () => void;
  reset: () => void;
}

const createAuthStore: StateCreator<AuthState> = set => {
  const initialState: AuthState = {
    isAuthenticated: false,
    permissions: [],
    setAuthenticated: isAuthenticated => set({ isAuthenticated }),
    logout: () => set({ isAuthenticated: false, permissions: [] }),
    setPermissions: permissions => set({ permissions }),
    clearPermissions: () => set(() => ({ permissions: [] })),
    // Reset function
    reset: () => set(initialState),
  };

  return initialState;
};

const useAuthStore = create<AuthState>()(
  devtools(
    persist(createAuthStore, {
      name: 'auth-storage',
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }),
    { name: 'AuthStore' }
  )
);

useAuthStore.subscribe(() => {});

export default useAuthStore;
