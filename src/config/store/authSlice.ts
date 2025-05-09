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
  posType: number | string;
  startDate: Date;
  endDate: Date;
  deviceId: number | undefined;
  documentType: string;
  wareHouseId: number | string;
  pageNumber: number;
  currentPage: number;
  pageSize: number;
  city: number | string;
  setTokens: (tokens: { tokens: Tokens }) => void;
  clearTokens: () => void;
  setPermissions: (permissions: Permission[]) => void;
  setPosType: (posType: number | string) => void;
  setStartDate: (startDate: Date) => void;
  setEndDate: (endDate: Date) => void;
  setDeviceId: (deviceId: number | undefined) => void;
  setDocumentType: (documentType: string) => void;
  setWareHouseId: (wareHouseId: number | string) => void;
  setPageNumber: (pageNumber: number) => void;
  clearPermissions: () => void;
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (pageSize: number) => void;
  setCity: (city: number | string) => void;
  reset: () => void;
}

const today = new Date();
const formattedDate = today.toISOString().slice(0, 10);
const startDate = new Date(`${formattedDate} 00:00`);
const endDate = new Date(`${formattedDate} 23:59`);

const createAuthStore: StateCreator<AuthState> = (set) => {
  const initialState: AuthState = {
    tokens: null,
    permissions: [],
    posType: "*",
    startDate: startDate,
    endDate: endDate,
    deviceId: undefined,
    documentType: "",
    wareHouseId: "*",
    pageNumber: 15,
    currentPage: 1,
    pageSize: 10,
    city: "*",
    setTokens: (tokens) => set(() => ({ tokens: tokens.tokens })),
    clearTokens: () => set(() => ({ tokens: null })),
    setPermissions: (permissions) => set({ permissions }),
    setPosType: (posType) => set({ posType }),
    setStartDate: (startDate) => set({ startDate }),
    setEndDate: (endDate) => set({ endDate }),
    setDeviceId: (deviceId) => set({ deviceId }),
    setDocumentType: (documentType) => set({ documentType }),
    setWareHouseId: (wareHouseId) => set({ wareHouseId }),
    setPageNumber: (pageNumber) => set({ pageNumber }),
    clearPermissions: () => set(() => ({ permissions: [] })),
    setCurrentPage: (currentPage) => set({ currentPage }),
    setPageSize: (pageSize) => set({ pageSize }),
    setCity: (city) => set({ city }),
    
    // Reset function
    reset: () => set(initialState),
  };

  return initialState;
};

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
