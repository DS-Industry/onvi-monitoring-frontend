import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@/components/ui/Notification';
const CurrentTariff = React.lazy(() => import('./CurrentTariff'));
const ChangeTariff = React.lazy(() => import('./ChangeTariff'));
import GenericTabs from '@ui/Tabs/GenericTab';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const Subscriptions: React.FC = () => {
  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('current');
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);
  const navigate = useNavigate();

  const tabItems = [
    {
      key: 'current',
      label: t('subscriptions.current'),
      content: <CurrentTariff setActiveTab={setActiveTabKey} />,
    },
    {
      key: 'change',
      label: t('subscriptions.change'),
      content: <ChangeTariff />,
    },
  ];

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.subscriptions')}
        </span>
      </div>
      <div className="mt-5">
        {isNotificationVisible && (
          <Notification
            title={t('subscriptions.you')}
            message={t('subscriptions.if')}
            message2={t('subscriptions.write')}
            showRocket={true}
            onClose={() => setIsNotificationVisible(false)}
          />
        )}
        <GenericTabs
          tabs={tabItems}
          defaultActiveKey="current"
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          tabBarGutter={24}
          tabBarStyle={{ marginBottom: 24 }}
          type="line"
        />
      </div>
    </>
  );
};

export default Subscriptions;
