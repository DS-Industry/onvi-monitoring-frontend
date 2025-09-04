import { Button, Table, Typography } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import Notification from '@ui/Notification.tsx';
import { getStatusTagRender } from '@/utils/tableUnits';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const MarketingCompanies: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const tagRender = getStatusTagRender(t);
  const navigate = useNavigate();

  const promotions = [
    {
      key: '1',
      name: 'Скидка 30% на все мойки',
      status: t('tables.ACTIVE'),
      type: '—',
      date: '—',
    },
    {
      key: '2',
      name: 'Промокод для фанатов ЦСКА',
      status: t('tables.ACTIVE'),
      type: '—',
      date: '—',
    },
  ];

  const columns = [
    {
      title: 'Название акции',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text className="text-primary02 text-sm font-semibold">{text}</Text>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: tagRender,
      align: 'center' as const,
    },
    {
      title: 'Тип Акции',
      dataIndex: 'type',
      key: 'type',
      align: 'center' as const,
      render: () => <span>—</span>, // Example placeholder
    },
    {
      title: 'Дата запуска',
      dataIndex: 'date',
      key: 'date',
      align: 'center' as const,
      render: () => <span>—</span>, // Example placeholder
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.marketingCompanies')}
          </span>
        </div>
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() =>
            navigate('/marketing/companies/new/marketing/campaign')
          }
        >
          <div className="hidden sm:flex">{t('routes.newPromotion')}</div>
        </Button>
      </div>
      <div className="mt-2">
        {notificationVisible && (
          <Notification
            title={t('routes.share')}
            message={t('marketing.promotion')}
            showBonus={true}
            onClose={() => setNotificationVisible(false)}
          />
        )}
      </div>
      <div className="mt-6">
        <Table
          dataSource={promotions}
          columns={columns}
          pagination={false}
          bordered={false}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default MarketingCompanies;
