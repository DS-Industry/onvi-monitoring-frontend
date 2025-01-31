import React from "react";
import Close from "@/assets/icons/close.svg?react";

interface ToastProps {
  id: number;
  textColor: string;
  bgColor: string;
  onClose: (id:number) => void;
  children: React.ReactNode;
}

const Toast: React.FC<ToastProps> = ({
  id,
  textColor,
  bgColor,
  onClose,
  children,
}) => {
  return (
    <div
      className={`relative w-full text-${textColor} bg-${bgColor} p-4 rounded-[18px]`}
    >
      {children}
      <button onClick={() => onClose(id)} className="absolute right-0 top-0 p-4 text-opacity01 hover:text-text01">
        <Close />
      </button>
    </div>
  );
};

export default Toast;
