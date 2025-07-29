import React, { useState, createContext, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { message } from 'antd';

interface ButtonCreateProviderProps {
  children: React.ReactNode;
}

type ToastContextType = {
  showToast: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
};

export const ButtonCreateContext = createContext({
  buttonOn: false,
  setButtonOn: (buttonOn: boolean) => {
    console.log(buttonOn);
  },
});
export const FilterContext = createContext({
  filterOpen: false,
  setFilterOpen: (filterOpen: boolean) => {
    console.log(filterOpen);
  },
});
export const FilterOpenContext = createContext({
  filterOn: false,
  setFilterOn: (filterOn: boolean) => {
    console.log(filterOn);
  },
});
export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ContextProvider = ({ children }: ButtonCreateProviderProps) => {
  const [buttonOn, setButtonOn] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOn, setFilterOn] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const showToast = useCallback(
    (msg: string, type: "success" | "error" | "info" | "warning") => {
      const getMessageClassName = (type: string) => {
        switch (type) {
          case "success":
            return "text-green-500";
          case "error":
            return "text-red-500";
          case "info":
            return "text-blue-500";
          case "warning":
            return "text-yellow-500";
          default:
            return "";
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

  const location = useLocation();

  useEffect(() => {
    setButtonOn(false);
    setFilterOpen(false);
  }, [location.pathname]);

  return (
    <ButtonCreateContext.Provider value={{ buttonOn, setButtonOn }}>
      <FilterContext.Provider value={{ filterOpen, setFilterOpen }}>
        <FilterOpenContext.Provider value={{ filterOn, setFilterOn }}>
          <ToastContext.Provider value={{ showToast }}>
            {contextHolder}
            {children}
          </ToastContext.Provider>
        </FilterOpenContext.Provider>
      </FilterContext.Provider>
    </ButtonCreateContext.Provider>
  );
};
