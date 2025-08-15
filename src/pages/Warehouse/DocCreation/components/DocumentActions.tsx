import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import Button from '@ui/Button/Button';

interface DocumentActionsProps {
  onCancel: () => void;
  onSave: () => void;
  onSend: () => void;
  isSaving: boolean;
  isSending: boolean;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  onCancel,
  onSave,
  onSend,
  isSaving,
  isSending,
}) => {
  const { t } = useTranslation();
  const userPermissions = usePermissions();

  return (
    <Can
      requiredPermissions={[
        { action: 'manage', subject: 'Warehouse' },
        { action: 'create', subject: 'Warehouse' },
      ]}
      userPermissions={userPermissions}
    >
      {allowed =>
        allowed && (
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
            <Button
              type="outline"
              title={t('organizations.cancel')}
              handleClick={onCancel}
            />
            <Button
              type="outline"
              title={t('warehouse.saveDraft')}
              form={true}
              isLoading={isSaving}
              handleClick={onSave}
            />
            <Button
              title={t('warehouse.saveAccept')}
              form={true}
              isLoading={isSending}
              handleClick={onSend}
            />
          </div>
        )
      }
    </Can>
  );
};

export default DocumentActions;