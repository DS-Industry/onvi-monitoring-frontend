import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getStatusTagRender } from '@/utils/tableUnits';
import { StatusTechTask } from '@/services/api/equipment';

interface UpdateTechTaskModalHeaderProps {
  techTaskId?: number;
  status?: StatusTechTask;
  isDeleting: boolean;
  hasUpdatePermission: boolean;
  onEditToggle: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const UpdateTechTaskModalHeader: React.FC<UpdateTechTaskModalHeaderProps> = ({
  techTaskId,
  status,
  isDeleting,
  hasUpdatePermission,
  onEditToggle,
  onDelete,
  onClose,
}) => {
  const { t } = useTranslation();
  const statusRender = getStatusTagRender(t);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span>{t('routes.technicalTasks')} / {techTaskId}</span>
        {status && (
          <div className="flex items-center">
            {statusRender(t(`tables.${status}`))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {hasUpdatePermission && (
          <button
            onClick={onEditToggle}
            className={`p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700`}
            title={t('common.edit')}
          >
            <EditOutlined />
          </button>
        )}
        {hasUpdatePermission && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 rounded hover:bg-gray-100 text-red-500 hover:text-red-700"
            title={t('techTasks.delete')}
          >
            <DeleteOutlined />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          title={t('common.close')}
        >
          <CloseOutlined />
        </button>
      </div>
    </div>
  );
};

export default UpdateTechTaskModalHeader;
