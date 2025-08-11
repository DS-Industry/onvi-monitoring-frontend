import { create, StateCreator } from 'zustand';
import { persist, devtools } from 'zustand/middleware';


type Permission = {
  subject: string;
  action: string;
};
interface AuthState {
  isAuthenticated: boolean;
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
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
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

const createAuthStore: StateCreator<AuthState> = set => {
  const initialState: AuthState = {
    isAuthenticated: false,
    permissions: [],
    posType: '*',
    startDate: startDate,
    endDate: endDate,
    deviceId: undefined,
    documentType: '',
    wareHouseId: '*',
    pageNumber: 15,
    currentPage: 1,
    pageSize: 10,
    city: '*',
    setAuthenticated: isAuthenticated => set({ isAuthenticated }),
    logout: () => set({ isAuthenticated: false, permissions: [] }),
    setPermissions: permissions => set({ permissions }),
    setPosType: posType => set({ posType }),
    setStartDate: startDate => set({ startDate }),
    setEndDate: endDate => set({ endDate }),
    setDeviceId: deviceId => set({ deviceId }),
    setDocumentType: documentType => set({ documentType }),
    setWareHouseId: wareHouseId => set({ wareHouseId }),
    setPageNumber: pageNumber => set({ pageNumber }),
    clearPermissions: () => set(() => ({ permissions: [] })),
    setCurrentPage: currentPage => set({ currentPage }),
    setPageSize: pageSize => set({ pageSize }),
    setCity: city => set({ city }),

    // Reset function
    reset: () => set(initialState),
  };

  return initialState;
};

const useAuthStore = create<AuthState>()(
  devtools(
    persist(createAuthStore, {
      name: 'auth-storage',
      partialize: (state) => ({
        permissions: state.permissions,
        posType: state.posType,
        startDate: state.startDate,
        endDate: state.endDate,
        deviceId: state.deviceId,
        documentType: state.documentType,
        wareHouseId: state.wareHouseId,
        pageNumber: state.pageNumber,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        city: state.city,
      }),
    }),
    { name: 'AuthStore' }
  )
);

useAuthStore.subscribe(() => {});

export default useAuthStore;
