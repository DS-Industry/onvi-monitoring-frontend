import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@/components/ui/Notification';
const CurrentTariff = React.lazy(() => import('./CurrentTariff'));
const ChangeTariff = React.lazy(() => import('./ChangeTariff'));
const SubscriptionInvoices = React.lazy(
  () => import('./SubscriptionInvoices')
);
import GenericTabs from '@ui/Tabs/GenericTab';
import useSubscriptionStore from '@/config/store/subscriptionSlice';

const Subscriptions: React.FC = () => {
  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('current');
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );

  useEffect(() => {
    if (!activeSubscription) {
      setActiveTabKey('change');
    }
  }, [activeSubscription]);

  const tabItems = [
    ...(activeSubscription
      ? [
          {
            key: 'current',
            label: t('subscriptions.current'),
            content: <CurrentTariff setActiveTab={setActiveTabKey} />,
          },
          {
            key: 'invoices',
            label: t('subscriptions.invoices') || 'Invoices',
            content: <SubscriptionInvoices />,
          },
        ]
      : []),
    {
      key: 'change',
      label: t('subscriptions.change'),
      content: <ChangeTariff />,
    },
  ];

  return (
    <>
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
          defaultActiveKey={activeSubscription ? 'current' : 'change'}
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
