import React, { ReactNode } from 'react';
import Button from '@ui/Button/Button';
import AntdModal from 'antd/es/modal';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  handleClick?: () => void;
  children: ReactNode;
  classname?: string;
  loading?: boolean;
  typeSubmit?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  handleClick,
  classname,
  loading,
}) => {
  if (!isOpen) return null;

  // Define the modal content to ensure proper event handling
  const modalContent = (
    <div
      className={`bg-white p-5 rounded-2xl shadow-lg max-h-[90vh] overflow-auto w-full ${classname}`}
    >
      {children}
      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-5">
        {onClose && (
          <Button
            title={'Сбросить'}
            handleClick={onClose}
            type="outline"
            classname="w-[141px]"
          />
        )}
        {handleClick && (
          <Button
            title={'Сохранить'}
            handleClick={handleClick}
            isLoading={loading}
            classname="w-[141px]"
          />
        )}
      </div>
    </div>
  );

  return (
    <AntdModal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width="auto"
      wrapClassName="flex justify-center items-center pointer-events-auto"
      styles={{
        mask: {
          zIndex: 50,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        wrapper: {
          zIndex: 51,
          pointerEvents: 'auto',
        },
        content: {
          pointerEvents: 'auto',
          padding: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
        },
        body: {
          padding: 0,
          pointerEvents: 'auto',
        },
      }}
    >
      {modalContent}
    </AntdModal>
  );
};

export default Modal;
