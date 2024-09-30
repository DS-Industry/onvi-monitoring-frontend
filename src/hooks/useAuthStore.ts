import useAuthStore from '../config/store/authSlice';
import { Tokens } from '../config/store/authSlice';

export const useTokens = () => {
  return useAuthStore((state) => state.tokens as Tokens);
};

export const useSetTokens = () => {
  return useAuthStore((state) => state.setTokens);
};

export const useClearJwtToken = () => {
  return useAuthStore((state) => state.clearTokens);
};
