// components/AddWorkerModal.tsx
import React from 'react';
import Modal from '@/components/ui/Modal/Modal';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import Button from '@/components/ui/Button/Button';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Close from '@icons/close.svg?react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: number) => void;
  workers: { name: string; surname: string; value: number }[];
};

const AddWorkerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  workers,
}) => {
  const { handleSubmit, setValue, watch } = useForm<{ userId: number }>();
  const selectedUserId = watch('userId');
  const { t } = useTranslation();

  const handleFormSubmit = () => {
    if (selectedUserId) {
      onSubmit(selectedUserId);
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01">
            {t('finance.addNew')}
          </h2>
          <Close onClick={onClose} className="cursor-pointer text-text01" />
        </div>
        <DropdownInput
          label="Select Worker"
          options={workers.map(w => ({
            name: `${w.name} ${w.surname}`,
            value: w.value,
          }))}
          value={selectedUserId}
          onChange={val => setValue('userId', val)}
          classname="w-[292px]"
        />
        <div className="flex justify-end">
          <Button title="Add" form={true} />
        </div>
      </form>
    </Modal>
  );
};

export default AddWorkerModal;
