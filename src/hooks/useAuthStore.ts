import useAuthStore from '@/config/store/authSlice';
import api from '@/config/axiosConfig';
import { getCsrfToken } from '@/services/api/platform';

export const useIsAuthenticated = () => {
  return useAuthStore(state => state.isAuthenticated);
};

export const useSetAuthenticated = () => {
  return useAuthStore(state => state.setAuthenticated);
};

export const useLogout = () => {
  return useAuthStore(state => state.logout);
};

export const useCheckAuth = () => {
  const setAuthenticated = useSetAuthenticated();

  return async () => {
    try {
      await api.get('/user/auth/validate');

      await getCsrfToken();
      setAuthenticated(true);
      return true;
    } catch (error) {
      setAuthenticated(false);
      return false;
    }
  };
};

export const usePermissions = () => {
  return useAuthStore(state => state.permissions);
};

export const useSetPermissions = () => {
  return useAuthStore(state => state.setPermissions);
};

export const useClearPermissions = () => {
  return useAuthStore(state => state.clearPermissions);
};
