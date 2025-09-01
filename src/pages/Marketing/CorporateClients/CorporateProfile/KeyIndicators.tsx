import { Space, Row, Col, Card, Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const KeyIndicators: React.FC = () => {
  const { t } = useTranslation();

  const statsData = [
    {
      value: `${14000} ₽`,
      label: t('marketing.total'),
    },
    {
      value: `${100}`,
      label: t('marketing.number'),
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
