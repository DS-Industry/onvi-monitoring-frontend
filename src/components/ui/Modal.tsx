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
      <div className="bg-white p-6 rounded-2xl shadow-lg z-10 max-w-96">
        {children}
        <button
          onClick={onClose}
          className="mb-4 p-2 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
