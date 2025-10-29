import React from 'react';
import { Card, Tag, Typography } from 'antd';
import {
  UserOutlined,
  PauseOutlined,
  DownloadOutlined,
  RightOutlined,
  NotificationFilled,
  ArrowRightOutlined,
  CarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { MarketingCampaignResponse } from '@/services/api/marketing';

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

  const statusConfig: Record<
    string,
    {
      color: string;
      iconBg: string;
      icon: React.ReactNode;
      label: string;
    }
  > = {
    [t('tables.ACTIVE')]: {
      color: 'green',
      iconBg: '#BFFA00',
      icon: <NotificationFilled style={{ color: 'black', fontSize: 24 }} />,
      label: t('tables.ACTIVE'),
    },
    [t('tables.PAUSE')]: {
      color: 'orange',
      iconBg: '#BFFA00',
      icon: <PauseOutlined style={{ color: 'black', fontSize: 24 }} />,
      label: t('tables.PAUSE'),
    },
    DRAFT: {
      color: 'red',
      iconBg: '#BFFA00',
      icon: <DownloadOutlined style={{ color: 'black', fontSize: 24 }} />,
      label: t('tables.DRAFT'),
    },
  };
  const config = statusConfig[status] ?? statusConfig.DRAFT;
  const { color, iconBg, icon, label } = config;

  return (
    <Card
      hoverable
      onClick={onClick}
      className="w-full h-full"
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        minWidth: 293
      }}
      loading={loading}
    >
      <div className="flex justify-between items-start mb-3">
        <div
          style={{
            background: iconBg,
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          {icon}
        </div>
        <Tag color={color}>{label}</Tag>
      </div>

      <div className="text-sm font-semibold">{campaign.name}</div>

      <Text type="secondary" ellipsis={{ tooltip: campaign.description }}>
        {campaign.description}
      </Text>

      <div className="flex space-x-2 text-text02 text-sm">
        <div className="flex items-center">
          {dayjs(campaign.launchDate).format('DD.MM.YYYY,hh:mm')}
        </div>
        <ArrowRightOutlined style={{ fontSize: 10 }} />
        <div className="flex items-center">
          {dayjs(campaign.endDate).format('DD.MM.YYYY,hh:mm')}
        </div>
      </div>

      <div className="flex flex-row mt-3 text-sm text-text01">
        <div className="flex">
          <CarOutlined style={{ fontSize: 16 }} />
          <div className="text-xs">
            <div className="text-text01">{t('marketingLoyalty.branches')}</div>
            <div className="text-base03">{campaign.posCount}</div>
          </div>
        </div>
        <div className="flex">
          <UserOutlined style={{ fontSize: 16 }} />
          <div className="text-xs">
            <div className="text-text01">{t('constants.status')}</div>
            <div className="text-base03">{t(`marketing.${campaign.type}`)}</div>
          </div>
        </div>
        <div className="text-primary02 text-sm flex items-center ml-2 cursor-pointer">
          {t('actions.edit')}
          <RightOutlined />
        </div>
      </div>
    </Card>
  );
};

export default CampaignCard;
