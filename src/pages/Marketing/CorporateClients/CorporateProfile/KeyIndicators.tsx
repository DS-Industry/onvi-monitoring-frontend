import { getCorporateClientStatsById } from '@/services/api/marketing';
import { Space, Row, Col, Card, Typography, Alert, Spin } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

const { Title, Text } = Typography;

const KeyIndicators: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');

  const { data: stats, isLoading } = useSWR(
    clientId ? ['user-key-stats', clientId] : null,
    () => getCorporateClientStatsById(Number(clientId!)),
    {
      shouldRetryOnError: false
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Spin size="large" />
      </div>
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
      value: `${stats.totalBalance} ₽`,
      label: t('marketing.total'),
    },
    {
      value: `${stats.numberOfCards}`,
      label: t('marketing.numOfCards'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="font-semibold text-text01 text-2xl">
        {t('marketing.key')}
      </div>
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
    </div>
  );
};

export default KeyIndicators;
