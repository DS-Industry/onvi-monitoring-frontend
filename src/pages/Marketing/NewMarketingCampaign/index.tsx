import { updateSearchParams } from '@/utils/searchParamsUtils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Settings from './Settings';
import GenericTabs from '@/components/ui/Tabs/GenericTab';
import { Modal, Button, DatePicker } from 'antd';

const NewMarketingCampaign: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

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
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        closeIcon={true}
        width={700}
        styles={{ mask: { background: 'rgba(0,0,0,0.05)' } }}
        maskClosable={true}
        className="custom-top-right-modal"
      >
        <div className="relative">
          <div className="px-8 py-7">
            <h2 className="font-bold text-2xl mb-2">
              {t('marketing.launchControl')}
            </h2>
            <div className="mb-6 text-base text-text01">
              {t('marketing.launchControlDesc')}
            </div>
            <div className="flex mb-6 gap-2">
              <Button
                type="primary"
                className="flex items-center font-semibold text-base"
              >
                <span className="mr-2">▶</span>
                {t('marketing.launchNow')}
              </Button>
              <span className="ml-2 text-text01 text-sm">
                {t('marketing.launchNowDesc')}
              </span>
            </div>
            <hr className="border-[#EEE]" />
            <div className="mt-6">
              <div className="text-xl font-semibold mb-4">
                {t('marketing.delayedStart')}
              </div>
              <div className="flex gap-3 items-end">
                <div>
                  <div className="text-base mb-1">{t('marketing.date')}</div>
                  <DatePicker
                    format="DD.MM.YYYY"
                    className="w-40 h-10"
                    placeholder={t('marketing.date')}
                  />
                </div>
                <Button
                  type="primary"
                  className="h-10 px-8 font-semibold text-base"
                >
                  {t('marketing.schedule')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <style>
        {`
.custom-top-right-modal .ant-modal-content {
  margin: 0 !important; 
  position: fixed !important;
  top: 1.25rem !important; /* adjust vertical offset */
  right: 1.5rem !important; /* adjust horizontal offset */
  max-width: 700px;
  border-radius: 1.5rem;
}

`}
      </style>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.newMarketingCampaign')}
          </span>
        </div>
        <div
          className="text-primary02 cursor-pointer font-semibold"
          onClick={() => setModalOpen(true)}
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
