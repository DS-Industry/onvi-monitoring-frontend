import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import Button from "../Button/Button";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  handleClick?: () => void;
  children: ReactNode;
  classname?: string;
  loading?: boolean;
  typeSubmit?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, handleClick, classname, loading }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-60" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div 
        className={`bg-white p-5 rounded-2xl shadow-lg z-10 max-h-[90vh] overflow-auto w-full sm:w-3/4 md:w-1/2 ${classname}`}
      >
        {children}
        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          {onClose && (
            <Button title={"Сбросить"} handleClick={onClose} type="outline" />
          )}
          {handleClick && (
            <Button title={"Сохранить"} handleClick={handleClick} isLoading={loading} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};


export default Modal;
