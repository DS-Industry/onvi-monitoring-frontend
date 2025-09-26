import React from 'react';
import { useTranslation } from 'react-i18next';
import BasicInformation from './BasicInformation';
import KeyIndicators from './KeyIndicators';
import Cards from './Cards';
import Operations from './Operations';
import GenericTabs from '@/components/ui/Tabs/GenericTab';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const CorporateProfile: React.FC = () => {
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
      content: <KeyIndicators />,
    },
    {
      key: 'cards',
      label: t('marketing.cards'),
      content: <Cards />,
    },
    {
      key: 'operations',
      label: t('marketing.operations'),
      content: <Operations />,
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('corporateClients.name')}
          </span>
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

export default CorporateProfile;
