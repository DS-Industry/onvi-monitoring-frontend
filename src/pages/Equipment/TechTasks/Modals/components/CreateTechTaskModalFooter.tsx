import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

interface CreateTechTaskModalFooterProps {
  isMutating: boolean;
  onCancel: () => void;
}

const CreateTechTaskModalFooter: React.FC<CreateTechTaskModalFooterProps> = ({
  isMutating,
  onCancel,
}) => {
  const { t } = useTranslation();


  return (
    <div className="flex justify-end gap-3 p-6 pt-4">
      <Button onClick={onCancel} size="large">
        {t('common.cancel')}
      </Button>
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        loading={isMutating}
      >
        {t('common.create')}
      </Button>
    </div>
  );
};

export default CreateTechTaskModalFooter;
