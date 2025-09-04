import { updateSearchParams } from '@/utils/searchParamsUtils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Settings from './Settings';
import GenericTabs from '@/components/ui/Tabs/GenericTab';

const NewMarketingCampaign: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'settings';

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      tab: key,
    });
  };

  const tabItems = [
    {
      key: 'settings',
      label: t('routes.settings'),
      content: <Settings />,
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.newMarketingCampaign')}
          </span>
        </div>
        <div
          className="text-primary02 font-semibold"
        >
          {t('marketing.launchControl')}
        </div>
      </div>
      <div className="max-w-5xl bg-white">
        <GenericTabs
          tabs={tabItems}
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarGutter={24}
          tabBarStyle={{ marginBottom: 24 }}
          type="line"
        />
      </div>
    </div>
  );
};

export default NewMarketingCampaign;
