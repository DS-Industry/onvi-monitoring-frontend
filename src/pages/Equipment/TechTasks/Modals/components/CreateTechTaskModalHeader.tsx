import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloseOutlined } from '@ant-design/icons';

interface CreateTechTaskModalHeaderProps {
  onClose: () => void;
}

const CreateTechTaskModalHeader: React.FC<CreateTechTaskModalHeaderProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <span>{t('routes.technicalTasks')} / {t('techTasks.createTask')}</span>
      <button
        onClick={onClose}
        className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        title={t('common.close')}
      >
        <CloseOutlined />
      </button>
    </div>
  );
};

export default CreateTechTaskModalHeader;
