import { useContext } from 'react';
import { ToastContext } from '@/components/context/Context';

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ContextProvider');
  }
  
  return context;
};