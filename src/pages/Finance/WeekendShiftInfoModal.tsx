import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import useSWRMutation from 'swr/mutation';
import { deleteDayShift } from '@/services/api/finance';
import useAuthStore from '@/config/store/authSlice';
import hasPermission from '@/permissions/hasPermission';

interface WeekendShiftInfoModalProps {
  open: boolean;
  onClose: () => void;
  shiftData: {
    id: number;
    workerName: string;
    typeWorkDay: string;
    start: Date;
    end: Date;
  };
  onDeleteSuccess: () => void;
}

const WeekendShiftInfoModal: React.FC<WeekendShiftInfoModalProps> = ({
  open,
  onClose,
  shiftData,
  onDeleteSuccess,
}) => {
  const { t } = useTranslation();
  const userPermissions = useAuthStore(state => state.permissions);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { trigger: deleteShift, isMutating: loadingDelete } = useSWRMutation(
    ['delete-shift-modal'],
    () => deleteDayShift(shiftData.id)
  );

  const handleDelete = async () => {
    setConfirmOpen(false);
    try {
      await deleteShift();
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const canDelete = hasPermission(
    [
      { subject: 'ShiftReport', action: 'create' },
      { subject: 'ShiftReport', action: 'manage' },
    ],
    userPermissions
  );

  return (
    <>
      <Modal
        title={t('finance.shiftInfo')}
        open={open}
        onCancel={onClose}
        footer={
          <>
            <Button key="close" onClick={onClose}>
              {t('common.close')}
            </Button>
            {canDelete && (
              <Button
                key="delete"
                type="primary"
                danger
                onClick={() => setConfirmOpen(true)}
                loading={loadingDelete}
              >
                {t('actions.delete')}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">{t('finance.employeeName')}</p>
            <p className="font-medium">{shiftData.workerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('shift.workType')}</p>
            <p className="font-medium">{t(`finance.${shiftData.typeWorkDay}`)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('finance.shiftHours')}</p>
            <p className="font-medium">
              {dayjs(shiftData.start).format('HH:mm')} - {dayjs(shiftData.end).format('HH:mm')}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        title={t('finance.confirmDeleteShift')}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmOpen(false)}>
            {t('actions.cancel')}
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDelete}>
            {t('actions.delete')}
          </Button>,
        ]}
      >
        <p>{t('finance.deleteShiftWarning')}</p>
      </Modal>
    </>
  );
};

export default WeekendShiftInfoModal;