import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
const BasicInformation = React.lazy(() => import('./BasicInformation'));
const KeyTab = React.lazy(() => import('./KeyTab'));
const Communication = React.lazy(() => import('./Communication'));
const Loyalty = React.lazy(() => import('./Loyalty'));
const Actions = React.lazy(() => import('./Actions'));
import GenericTabs from '@ui/Tabs/GenericTab';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const ClientsProfile: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'basic';

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      tab: key,
    });
  };

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
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.clientProfile')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>
      <div className="max-w-5xl ml-10 bg-white p-4 rounded-md shadow-sm">
        <GenericTabs
          tabs={tabItems}
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarGutter={24}
          tabBarStyle={{ marginBottom: 24 }}
          type="line"
        />
      </div>
    </>
  );
};

export default ClientsProfile;
