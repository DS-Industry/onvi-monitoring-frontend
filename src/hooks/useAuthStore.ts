import useAuthStore from '@/config/store/authSlice';
import api from '@/config/axiosConfig';

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
      await api.get('/auth/validate');
      setAuthenticated(true);
      return true;
    } catch (error) {
      setAuthenticated(false);
      return false;
    }
  };
};

export const usePosType = () => {
  return useAuthStore(state => state.posType);
};

export const useStartDate = () => {
  return useAuthStore(state => state.startDate);
};

export const useEndDate = () => {
  return useAuthStore(state => state.endDate);
};

export const useDeviceId = () => {
  return useAuthStore(state => state.deviceId);
};

export const useSetPosType = () => {
  return useAuthStore(state => state.setPosType);
};

export const useSetStartDate = () => {
  return useAuthStore(state => state.setStartDate);
};

export const useSetEndDate = () => {
  return useAuthStore(state => state.setEndDate);
};

export const useSetDeviceId = () => {
  return useAuthStore(state => state.setDeviceId);
};

export const usePermissions = () => {
  return useAuthStore(state => state.permissions);
};

export const useWareHouseId = () => {
  return useAuthStore(state => state.wareHouseId);
};

export const usePageNumber = () => {
  return useAuthStore(state => state.pageNumber);
};

export const useCurrentPage = () => {
  return useAuthStore(state => state.currentPage);
};

export const usePageSize = () => {
  return useAuthStore(state => state.pageSize);
};

export const useCity = () => {
  return useAuthStore(state => state.city);
};

export const useSetPermissions = () => {
  return useAuthStore(state => state.setPermissions);
};

export const useDocumentType = () => {
  return useAuthStore(state => state.documentType);
};

export const useSetDocumentType = () => {
  return useAuthStore(state => state.setDocumentType);
};

export const useSetWareHouseId = () => {
  return useAuthStore(state => state.setWareHouseId);
};

export const useSetPageNumber = () => {
  return useAuthStore(state => state.setPageNumber);
};

export const useClearPermissions = () => {
  return useAuthStore(state => state.clearPermissions);
};

export const useSetCurrentPage = () => {
  return useAuthStore(state => state.setCurrentPage);
};

export const useSetPageSize = () => {
  return useAuthStore(state => state.setPageSize);
};

export const useSetCity = () => {
  return useAuthStore(state => state.setCity);
};
