import useAuthStore from '../store/authSlice';

export const useJwtToken = () => {
  return useAuthStore((state) => state.jwtToken);
};

export const useSetJwtToken = () => {
  return useAuthStore((state) => state.setJwtToken);
};

export const useClearJwtToken = () => {
  return useAuthStore((state) => state.clearJwtToken);
};
