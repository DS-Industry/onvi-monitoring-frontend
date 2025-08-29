import React from 'react';
import { Card, Row, Col, Typography, Space, Spin, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore';
import { getUserKeyStatsByOrganizationId } from '@/services/api/marketing';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

const KeyTab: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();

  const [searchParams] = useSearchParams();

  const clientId = searchParams.get('userId')

  const { data: stats, error, isLoading } = useSWR(
    user.organizationId && clientId
      ? ['user-key-stats', user.organizationId, clientId]
      : null,
    () => getUserKeyStatsByOrganizationId({
      clientId: Number(clientId!),
      organizationId: user.organizationId!,
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to fetch user key stats"
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (!stats) {
    return (
      <Alert
        message="No Data"
        description="No user key stats available"
        type="info"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  const statsData = [
    { 
      value: `${stats.totalAmountSpent.toLocaleString()} ₽`, 
      label: t('marketing.total'),
    },
    { 
      value: `${stats.averageOrderAmount.toLocaleString()} ₽`, 
      label: t('marketing.avg'),
    },
    { 
      value: stats.totalOrdersCount.toString(), 
      label: t('marketing.number'),
    },
    { 
      value: `${stats.cardBalance.toLocaleString()} ₽`, 
      label: t('marketing.bonus'),
    },
    { 
      value: stats.cardNumber, 
      label: t('marketing.card'),
    },
    { 
      value: stats.lastOrderDate ? dayjs(stats.lastOrderDate).format('DD.MM.YYYY') : 'N/A', 
      label: t('marketing.lastOrder'),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Row gutter={[24, 24]}>
        {statsData.map((item, idx) => (
          <Col key={idx} xs={24} sm={12} md={8}>
            <Card
              variant={'borderless'}
              style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}
            >
              <Title level={2} style={{ marginBottom: 8 }}>
                {item.value}
              </Title>
              <Text type="secondary">{item.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
};

export default KeyTab;
