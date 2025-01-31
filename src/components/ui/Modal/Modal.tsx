import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import Button from "../Button/Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleClick?: () => void;
  children: ReactNode;
  classname?: string;
  loading?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, handleClick, classname, loading }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-60"
        onClick={onClose}
      ></div>
      <div className={`bg-white p-5 rounded-2xl shadow-lg z-10 ${classname}`}>
        {children}
        <div className="flex gap-3 mt-5">
          <Button
            title={"Сбросить"}
            handleClick={onClose}
            type="outline"
          />
          <Button
            title={"Сохранить"}
            handleClick={handleClick}
            isLoading={loading}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
