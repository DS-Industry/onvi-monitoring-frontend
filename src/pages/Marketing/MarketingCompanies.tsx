import { Button, Table } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import Notification from '@ui/Notification.tsx';
import { getStatusTagRender } from '@/utils/tableUnits';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
  getMarketingCampaign,
  MarketingCampaignResponse,
} from '@/services/api/marketing';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { useUser } from '@/hooks/useUserStore';

const MarketingCompanies: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const tagRender = getStatusTagRender(t);
  const navigate = useNavigate();

  const user = useUser();

  const { data: promotionsData, isLoading } = useSWR(
    user.organizationId ? ['marketing-campaigns', user.organizationId] : null,
    () => getMarketingCampaign(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false
    }
  );

  const promotions =
    promotionsData?.map(item => ({
      ...item,
      status: t(`tables.${item.status}`),
    })) || [];

  const columns: ColumnsType<MarketingCampaignResponse> = [
    {
      title: 'Название акции',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/marketing/companies/new/marketing/campaign',
              search: `?marketingCampaignId=${record.id}`,
            }}
            className="text-primary02 hover:text-primary02_Hover font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: tagRender,
    },
    {
      title: 'Тип Акции',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <span>{t(`tables.${text}`) || '—'}</span>,
    },
    {
      title: 'Дата запуска',
      dataIndex: 'launchDate',
      key: 'launchDate',
      render: (text: string) => (
        <span>{dayjs(text).format('DD.MM.YYYY') || '—'}</span>
      ),
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
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default MarketingCompanies;
