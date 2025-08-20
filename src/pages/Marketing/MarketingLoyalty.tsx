import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { getLoyaltyPrograms } from '@/services/api/marketing';
import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import dayjs from 'dayjs';

const MarketingLoyalty: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const navigate = useNavigate();

  const { data: loyaltyProgramsData, isLoading: loyaltyProgramsLoading } =
    useSWR('get-loyalty-programs', getLoyaltyPrograms, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    });
  const loyaltyPrograms =
    loyaltyProgramsData?.map(item => ({
      ...item.props,
      status: t(`tables.${item.props.status}`),
    })) || [];

  const statusRender = getStatusTagRender(t);
  const dateRender = getDateRender();

  const columnsLoyaltyPrograms = [
    {
      title: 'Название программы',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => {
        return (
          <Link
            to={{
              pathname: '/marketing/loyalty/bonus',
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
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
      render: statusRender,
    },
    {
      title: 'Дата запуска',
      dataIndex: 'startDate',
      key: 'startDate',
      render: dateRender,
    },
  ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.loyalty')}
          </span>
          <QuestionMarkIcon />
        </div>
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => {
            navigate('/marketing/loyalty/rewards');
          }}
        >
          {t('routes.add')}
        </Button>
      </div>
      <div className="mt-2">
        {notificationVisible && (
          <Notification
            title={t('routes.loyalty')}
            message={t('marketing.promotion')}
            showBonus={true}
            onClose={() => setNotificationVisible(false)}
          />
        )}
        <div className="mt-8">
          <Table
            dataSource={loyaltyPrograms.sort(
              (a, b) =>
                dayjs(b.startDate).toDate().getTime() -
                dayjs(a.startDate).toDate().getTime()
            )}
            columns={columnsLoyaltyPrograms}
            loading={loyaltyProgramsLoading}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    </>
  );
};

export default MarketingLoyalty;
