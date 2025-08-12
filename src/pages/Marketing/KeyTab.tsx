import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const KeyTab: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '14 000 ₽', label: t('marketing.total') },
    { value: '14 00 ₽', label: t('marketing.avg') },
    { value: '10', label: t('marketing.number') },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Row gutter={[24, 24]}>
        {stats.map((item, idx) => (
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
