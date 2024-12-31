import { create, StateCreator } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface Tokens {
  accessToken: string;
  accessTokenExp: Date;
  refreshToken: string;
  refreshTokenExp: Date;
}

type Permission = {
  subject: string;
  action: string;
};
interface AuthState {
  tokens: Tokens | null;
  permissions: Permission[];
  posType: number;
  startDate: Date;
  endDate: Date;
  deviceId: number;
  documentType: string;
  wareHouseId: number;
  setTokens: (tokens: { tokens: Tokens }) => void;
  clearTokens: () => void;
  setPermissions: (permissions: Permission[]) => void;
  setPosType: (posType: number) => void;
  setStartDate: (startDate: Date) => void;
  setEndDate: (endDate: Date) => void;
  setDeviceId: (deviceId: number) => void;
  setDocumentType: (documentType: string) => void;
  setWareHouseId: (wareHouseId: number) => void;
}

const today = new Date();
const formattedDate = today.toISOString().slice(0, 10);
const startDate = new Date(`${formattedDate} 00:00`);
const endDate = new Date(`${formattedDate} 23:59`);

const createAuthStore: StateCreator<AuthState> = (set) => ({
  tokens: null,
  permissions: [],
  posType: 1,
  startDate: startDate,
  endDate: endDate,
  deviceId: 0,
  documentType: "",
  wareHouseId: 0,
  setTokens: (tokens) =>
    set(() => ({
      tokens: tokens.tokens,
    })),
  clearTokens: () => set(() => ({ tokens: null })),
  setPermissions: (permissions) => set({ permissions }),
  setPosType: (posType) => set({ posType }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setDocumentType: (documentType) => set({documentType}),
  setWareHouseId: (wareHouseId) => set({wareHouseId})
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
