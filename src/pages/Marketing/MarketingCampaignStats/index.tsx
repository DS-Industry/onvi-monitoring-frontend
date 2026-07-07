import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

const MarketingCampaignStats: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center gap-10">
          <div
            className="flex cursor-pointer text-primary02"
            onClick={() => navigate(`/marketing/campaign/${id}`)}
          >
            <ArrowLeftOutlined />
            <p className="ms-2">{t('login.back')}</p>
          </div>
          <span className="text-xl font-normal text-text01 sm:text-3xl">
            {t('marketingLoyalty.stats')}
          </span>
        </div>
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-background02 p-8">
        <Text type="secondary">{t('marketingCampaigns.statsComingSoon')}</Text>
      </div>
    </div>
  );
};

export default MarketingCampaignStats;
