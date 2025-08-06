import useUserStore from '@/config/store/userSlice';
import { User } from '@/config/store/userSlice';

export const useUser = () => {
  return useUserStore(state => state.user as User);
};

export const useSetUser = () => {
  return useUserStore(state => state.setUser);
};

export const useClearUserData = () => {
  return useUserStore(state => state.clearUserData);
};
