import React from 'react';
import { useTranslation } from 'react-i18next';
const BasicInformation = React.lazy(() => import('./BasicInformation'));
const KeyTab = React.lazy(() => import('./KeyTab'));
const Communication = React.lazy(() => import('./Communication'));
const Loyalty = React.lazy(() => import('./Loyalty'));
const Actions = React.lazy(() => import('./Actions'));
import GenericTabs from '@ui/Tabs/GenericTab';

const ClientsProfile: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: 'basic',
      label: t('warehouse.basic'),
      content: <BasicInformation />,
    },
    {
      key: 'key',
      label: t('marketing.key'),
      content: <KeyTab />,
    },
    {
      key: 'comm',
      label: t('marketing.comm'),
      content: <Communication />,
    },
    {
      key: 'loyalty',
      label: t('news.loyalty'),
      content: <Loyalty />,
    },
    {
      key: 'actions',
      label: t('marketing.actions'),
      content: <Actions />,
    },
  ];

  return (
    <div className="max-w-5xl ml-10 bg-white p-4 rounded-md shadow-sm">
      <GenericTabs
        tabs={tabItems}
        defaultActiveKey="basic"
        tabBarGutter={24}
        tabBarStyle={{ marginBottom: 24 }}
        type="line"
      />
    </div>
  );
};

export default ClientsProfile;
