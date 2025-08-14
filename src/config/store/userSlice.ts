import { create, StateCreator } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
export interface User {
  id: number;
  userRoleId: number;
  name: string;
  surname: string;
  middlename?: string;
  birthday?: Date;
  phone?: string;
  email: string;
  password: string;
  gender: string;
  position: string;
  status: string;
  avatar?: string;
  country: string;
  countryCode: number;
  timezone: number;
  refreshTokenId: string;
  receiveNotifications: number;
  createdAt: Date;
  updatedAt: Date;
}
interface UserState {
  user: User | null;
  organizationIds: number[];
  setUser: (user: { user: User }) => void;
  setOrganizationIds: (organizationIds: number[]) => void;
  clearUserData: () => void;
}

// Define a state creator that applies both devtools and persist middleware
const createUserStore: StateCreator<UserState> = set => ({
  user: null,
  organizationIds: [],
  setUser: user =>
    set(() => ({
      user: user.user,
    })),
  setOrganizationIds: organizationIds =>
    set(() => ({
      organizationIds: organizationIds,
    })),
  clearUserData: () => set(() => ({ user: null })),
});

// Create the store with both middlewares
const useUserStore = create<UserState>()(
  devtools(
    persist(createUserStore, {
      name: 'user-storage', // name of the item in the storage (must be unique)
    }),
    { name: 'UserStore' }
  )
);

// Subscribe to state changes (optional)
useUserStore.subscribe(() => {});

// Export the store
export default useUserStore;
