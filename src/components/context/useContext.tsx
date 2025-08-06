import { useContext } from 'react';
import {
  ButtonCreateContext,
  FilterContext,
  FilterOpenContext,
  ToastContext,
} from './Context.tsx';

export const useButtonCreate = () => {
  return useContext(ButtonCreateContext);
};

export const useFilterOpen = () => {
  return useContext(FilterContext);
};

export const useFilterOn = () => {
  return useContext(FilterOpenContext);
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
