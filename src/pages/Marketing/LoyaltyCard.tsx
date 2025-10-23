import React from 'react';
import { Card, Tag, Typography } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  ShopOutlined,
  PauseOutlined,
  GiftOutlined,
  DownloadOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { LoyaltyProgramStatus } from '@/services/api/marketing';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

interface LoyaltyCardProps {
  title: string;
  date: Date;
  description: string;
  branches: number;
  clients: number;
  status: LoyaltyProgramStatus;
  onClick?: () => void;
  loading: boolean;
}

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  title,
  date,
  description,
  branches,
  clients,
  status,
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
      iconBg: '#2F80ED',
      icon: <GiftOutlined style={{ color: 'white', fontSize: 24 }} />,
      label: 'Активна',
    },
    [t('tables.PAUSE')]: {
      color: 'orange',
      iconBg: '#FB8C00',
      icon: <PauseOutlined style={{ color: 'white', fontSize: 24 }} />,
      label: 'Приостановлена',
    },
    DRAFT: {
      color: 'red',
      iconBg: '#BDBDBD',
      icon: <DownloadOutlined style={{ color: 'white', fontSize: 24 }} />,
      label: 'Черновик',
    },
  };
  const config = statusConfig[status] ?? statusConfig.DRAFT;
  const { color, iconBg, icon, label } = config;

  console.log('LoyaltyCard status:', status);

  return (
    <Card
      hoverable
      onClick={onClick}
      className="w-full h-full"
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        minHeight: '280px',
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
            fontSize: 32
          }}
        >
          {icon}
        </div>
        <Tag color={color}>{label}</Tag>
      </div>

      <Title level={5}>{title}</Title>

      <div className="flex items-center text-gray-500 text-sm mb-2">
        <CalendarOutlined style={{ marginRight: 6 }} />
        {dayjs(date).format('DD.MM.YYYY')}
      </div>

      <Text type="secondary" ellipsis={{ tooltip: description }}>
        {description}
      </Text>

      <div className="flex flex-col mt-3 text-sm text-text01">
        <div>
          <ShopOutlined style={{ marginRight: 6 }} />
          {t('marketingLoyalty.branches')}: {branches}
        </div>
        <div className="flex justify-between">
          <div>
            <UserOutlined style={{ marginRight: 6 }} />
            {t('routes.clients')}: {clients}
          </div>
          <div className="text-primary02 cursor-pointer">
            {t('marketingLoyalty.moreDetails')}
            <RightOutlined />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LoyaltyCard;
