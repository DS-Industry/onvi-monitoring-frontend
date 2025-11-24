import React from 'react';
import { Card, Typography } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  ArrowRightOutlined,
  CarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { MarketingCampaignResponse } from '@/services/api/marketing';
import { getStatusTagRender } from '@/utils/tableUnits';

const { Text } = Typography;

interface CampaignCardProps {
  campaign: MarketingCampaignResponse;
  onClick?: () => void;
  loading: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onClick,
  loading,
}) => {
  const { t } = useTranslation();

  const tagRender = getStatusTagRender(t);

  return (
    <Card
      hoverable
      onClick={onClick}
      className="w-full h-full"
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      loading={loading}
    >
      <div className="flex justify-between items-start mb-3">
        {tagRender(campaign.status)}
      </div>

      <div className="text-sm font-semibold">{campaign.name}</div>

      <Text type="secondary" ellipsis={{ tooltip: campaign.description }}>
        {campaign.description}
      </Text>

      <div className="flex flex-wrap items-center gap-1 text-text02 text-sm overflow-hidden">
        <div className="flex items-center whitespace-nowrap">
          {dayjs(campaign.launchDate).format('DD.MM.YYYY, HH:mm')}
        </div>
        <ArrowRightOutlined style={{ fontSize: 10 }} />
        <div className="flex items-center whitespace-nowrap">
          {dayjs(campaign.endDate).format('DD.MM.YYYY, HH:mm')}
        </div>
      </div>

      <div className="flex flex-row mt-3 text-sm text-text01">
        <div className="flex">
          <CarOutlined style={{ fontSize: 16 }} />
          <div className="text-xs ml-1">
            <div className="text-text01">{t('marketingLoyalty.branches')}</div>
            <div className="text-base03">{campaign.posCount}</div>
          </div>
        </div>
        <div className="flex">
          <UserOutlined style={{ fontSize: 16 }} />
          <div className="text-xs ml-1">
            <div className="text-text01">{t('constants.status')}</div>
            <div className="text-base03">
              {campaign.executionType
                ? t(`tables.${campaign.executionType}`)
                : '-'}
            </div>
          </div>
        </div>
        <div className="text-primary02 text-sm items-center ml-2 cursor-pointer flex justify-end">
          <EditOutlined />
        </div>
      </div>
    </Card>
  );
};

export default CampaignCard;
