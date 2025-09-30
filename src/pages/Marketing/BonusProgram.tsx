import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
const Settings = React.lazy(() => import('./Settings'));
const Levels = React.lazy(() => import('./Levels'));
const Events = React.lazy(() => import('./Events'));
import GenericTabs from '@ui/Tabs/GenericTab';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

type TAB = 'settings' | 'levels' | 'events';

const BonusProgram: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab') as TAB;
  const [activeTab, setActiveTab] = useState<TAB>(tabFromUrl || 'settings');

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as TAB);

    searchParams.set('tab', key);
    setSearchParams(searchParams, { replace: true });
  };

  const tabItems = [
    {
      key: 'settings',
      label: t('routes.settings'),
      content: <Settings />,
    },
    {
      key: 'levels',
      label: t('marketing.levels'),
      content: <Levels />,
    },
    {
      key: 'events',
      label: t('marketing.events'),
      content: <Events />,
    },
  ];

  return (
    <>
      <div>
        <div
          className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeftOutlined />
          <p className="ms-2">{t('login.back')}</p>
        </div>
      </div>
      <div className="w-full px-4 sm:px-8 mt-12 md:mt-0">
        <GenericTabs
          tabs={tabItems}
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarGutter={32}
          tabBarStyle={{ marginBottom: 24 }}
        />
      </div>
    </>
  );
};

export default BonusProgram;
