import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';

interface TechTaskModalFooterProps {
  hasUpdatePermission: boolean;
  isEditMode: boolean;
  isMutating: boolean;
  isCompleting: boolean;
  onCancel: () => void;
  onSave: () => void;
  onComplete: () => void;
}

const TechTaskModalFooter: React.FC<TechTaskModalFooterProps> = ({
  hasUpdatePermission,
  isEditMode,
  isMutating,
  isCompleting,
  onCancel,
  onSave,
  onComplete,
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
      ) : (
        <Button
          title={t('techTasks.complete')}
          handleClick={onComplete}
          isLoading={isCompleting}
        />
      )}
    </div>
  );
};

export default TechTaskModalFooter;
