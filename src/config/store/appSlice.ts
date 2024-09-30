import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  someAppState: string;
  setSomeAppState: (state: string) => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      someAppState: 'default value',
      setSomeAppState: (state: string) => set({ someAppState: state }),
    }),
    {
      name: 'app-storage',
    }
  )
);

export default useAppStore;
