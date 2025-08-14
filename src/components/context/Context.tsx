import React, { createContext, useCallback } from 'react';
import { message } from 'antd';

interface ContextProviderProps {
  children: React.ReactNode;
}

type ToastContextType = {
  showToast: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' | 'info' | 'warning') => {
      const getMessageClassName = (type: string) => {
        switch (type) {
          case 'success':
            return 'text-green-500';
          case 'error':
            return 'text-red-500';
          case 'info':
            return 'text-blue-500';
          case 'warning':
            return 'text-yellow-500';
          default:
            return '';
        }
      };

      const messageClassName = getMessageClassName(type);
      messageApi.open({
        type,
        content: <div className={messageClassName}>{msg}</div>,
        duration: 3,
      });
    },
    [messageApi]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {contextHolder}
      {children}
    </ToastContext.Provider>
  );
};
