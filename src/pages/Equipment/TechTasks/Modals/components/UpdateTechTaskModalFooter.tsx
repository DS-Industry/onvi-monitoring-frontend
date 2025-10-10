import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { StatusTechTask } from '@/services/api/equipment';

interface UpdateTechTaskModalFooterProps {
  hasUpdatePermission: boolean;
  isEditMode: boolean;
  isMutating: boolean;
  isCompleting: boolean;
  isReturning: boolean;
  taskStatus?: string;
  onCancel: () => void;
  onSave: () => void;
  onComplete: () => void;
  onReturn: () => void;
}

const UpdateTechTaskModalFooter: React.FC<UpdateTechTaskModalFooterProps> = ({
  hasUpdatePermission,
  isEditMode,
  isMutating,
  isCompleting,
  isReturning,
  taskStatus,
  onCancel,
  onSave,
  onComplete,
  onReturn,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-3 p-6 pt-4">
      <Button
        title={t('common.cancel')}
        type="outline"
        handleClick={onCancel}
      />
      {hasUpdatePermission && isEditMode ? (
        <Button
          title={t('common.save')}
          handleClick={onSave}
          isLoading={isMutating}
        />
      ) : taskStatus === StatusTechTask.FINISHED ? (
        <Button
          title={t('routine.return')}
          handleClick={onReturn}
          isLoading={isReturning}
        />
      ) : (
        <Button
          title={t('common.complete')}
          handleClick={onComplete}
          isLoading={isCompleting}
        />
      )}
    </div>
  );
};

export default UpdateTechTaskModalFooter;
