import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-60"
        onClick={onClose}
      ></div>
      <div className="bg-white p-5 rounded-2xl shadow-lg z-10 lg:w-[1070px]">
        {children}
        <div className="flex justify-end gap-3 mt-12">
          {/* <button
            className="px-8 py-2.5 font-semibold text-primary02"
            onClick={onClose}
          >
            Сбросить
          </button> */}
          <button
            className="px-8 py-2.5 bg-primary02 font-semibold text-text04 rounded-md"
            onClick={onClose}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
