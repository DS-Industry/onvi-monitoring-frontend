import useAppStore from '../config/store/appSlice';

export const useAppState = () => {
  return useAppStore((state) => state.someAppState);
};

export const useSetAppState = () => {
  return useAppStore((state) => state.setSomeAppState);
};
