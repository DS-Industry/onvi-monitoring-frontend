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

export const usePosType = () => {
  return useAuthStore((state) => state.posType);
}

export const useStartDate = () => {
  return useAuthStore((state) => state.startDate);
}

export const useEndDate = () => {
  return useAuthStore((state) => state.endDate);
}

export const useDeviceId = () => {
  return useAuthStore((state) => state.deviceId);
}

export const useSetPosType = () => {
  return useAuthStore((state) => state.setPosType);
}

export const useSetStartDate = () => {
  return useAuthStore((state) => state.setStartDate);
}

export const useSetEndDate = () => {
  return useAuthStore((state) => state.setEndDate);
}

export const useSetDeviceId = () => {
  return useAuthStore((state) => state.setDeviceId);
}

export const usePermissions = () => {
  return useAuthStore((state) => state.permissions);
}

export const useSetPermissions = () => {
  return useAuthStore((state) => state.setPermissions);
}