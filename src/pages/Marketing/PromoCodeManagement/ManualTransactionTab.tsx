import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ManualTransactionDrawer from './ManualTransactionDrawer';

interface ManualTransactionTabProps {
  organizationId: number;
}

const ManualTransactionTab: React.FC<ManualTransactionTabProps> = ({
  organizationId,
}) => {
  const { t } = useTranslation();
  const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);

  return (
    <>
      <Card>
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-3xl font-normal text-text01">
              {t('marketing.manualTransaction')}
            </span>
          </div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setTransactionDrawerOpen(true)}
          >
            <span className="hidden sm:flex">
              {t('routes.add')}
            </span>
          </Button>
        </div>

        <div className="mt-6">
          <p className="text-text02">
            {t('marketing.manualTransactionDescription')}
          </p>
        </div>
      </Card>

      <ManualTransactionDrawer
        isOpen={transactionDrawerOpen}
        onClose={() => setTransactionDrawerOpen(false)}
        organizationId={organizationId}
        onSuccess={() => setTransactionDrawerOpen(false)}
      />
    </>
  );
};

export default ManualTransactionTab;
