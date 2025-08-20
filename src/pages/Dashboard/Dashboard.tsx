import React from 'react';

// utils
import { useTranslation } from 'react-i18next';
import useUserStore from '@/config/store/userSlice';

// components
const News = React.lazy(() => import('./News'));
import GenericTabs from '@ui/Tabs/GenericTab';
import { Select } from 'antd';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const { user, setUser } = useUserStore();

  const tabItems = [
    {
      key: '0',
      label: t('dashboard.news'),
      content: <News />,
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.dashboard')}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center">
          <label className="block text-sm font-medium text-gray-700 mr-2">
            {t('warehouse.organization')}
          </label>
          <Select
            className="w-40 truncate"
            placeholder={t('filters.device.placeholder')}
            value={user?.organizationId || ''}
            onChange={val => {
              if (user) {
                setUser({ user: { ...user, organizationId: Number(val) } });
              }
            }}
            options={
              user?.organizations?.map(org => ({
                label: org.name,
                value: org.id,
              })) ?? []
            }
          />
        </div>
      </div>
      <div className="py-5">
        <GenericTabs tabs={tabItems} />
      </div>
    </div>
  );
};

export default Dashboard;
