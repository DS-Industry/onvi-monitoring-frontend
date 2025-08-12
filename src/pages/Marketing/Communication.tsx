import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const Communication: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: 0, label: t('marketing.sms') },
    { value: 0, label: t('marketing.letters') },
    { value: 0, label: t('marketing.chats') },
    { value: 0, label: t('marketing.inbox') },
    { value: 0, label: t('marketing.outgoing') },
  ];

  return (
    <Row gutter={[24, 24]}>
      {stats.map((stat, idx) => (
        <Col xs={24} sm={12} md={8} key={idx}>
          <Card
            bordered={false}
            style={{
              backgroundColor: '#f5f5f5', 
              borderRadius: 8,
            }}
          >
            <Title level={2} style={{ marginBottom: 8, color: '#1f1f1f' }}>
              {stat.value}
            </Title>
            <Text type="secondary">{stat.label}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Communication;
