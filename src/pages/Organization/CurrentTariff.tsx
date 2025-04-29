import React from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Typography, Divider, Button, Space } from "antd";

const { Title, Text } = Typography;

const CurrentTariff: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full p-6 space-y-8">
      {/* Tariff Section */}
      <Row justify="space-between" align="top">
        <Col xs={24} md={12}>
          <Space direction="vertical" size="small" className="w-full">
            <Title level={4}>{t("subscriptions.tariff")}</Title>
            <Divider style={{ margin: 0 }} />
            <Title level={3} style={{ marginTop: 8 }}>{t("subscriptions.base")}</Title>
            <Text type="secondary">{t("subscriptions.ends")} 10.09.2024</Text>
          </Space>
        </Col>
        <Col xs={24} md={6} className="flex justify-end mt-4 md:mt-0">
          <Button type="primary">{t("subscriptions.change")}</Button>
        </Col>
      </Row>

      {/* Price Card */}
      <Card className="bg-gray-50">
        <Space direction="vertical" size="middle" className="w-full">
          <Row justify="space-between">
            <Text strong>{t("subscriptions.price_per_month")}</Text>
            <Text strong>1 000 ₽</Text>
          </Row>
          <Row justify="space-between">
            <Text strong>{t("subscriptions.price_per_year")}</Text>
            <Text strong>11 000 ₽</Text>
          </Row>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("subscriptions.single_payment_note")}
          </Text>
        </Space>
      </Card>

      {/* Modules Section */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size="small">
            <Title level={4}>{t("subscriptions.modules")}</Title>
            <Divider style={{ margin: 0 }} />
          </Space>
        </Col>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            3 {t("subscriptions.modules_count")}
          </Title>
        </Col>
      </Row>

      {/* Modules Card */}
      <Card>
        <Space direction="vertical" className="w-full">
          <Card size="small" bordered={false} className="bg-gray-50">
            {t("subscriptions.admin")}
          </Card>
          <Card size="small" bordered={false} className="bg-gray-50">
            {t("subscriptions.accounting")}
          </Card>
          <Card size="small" bordered={false} className="bg-gray-50">
            {t("subscriptions.data_analysis")}
          </Card>
        </Space>
      </Card>

      {/* Balance Section */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size="small">
            <Title level={4}>{t("subscriptions.current_balance")}</Title>
            <Divider style={{ margin: 0 }} />
          </Space>
        </Col>
        <Col>
          <Title level={4} style={{ margin: 0 }}>0 ₽</Title>
        </Col>
      </Row>

      {/* Recharge Button */}
      <div className="flex justify-end">
        <Button type="primary">{t("subscriptions.replenish")}</Button>
      </div>
    </div>
  );
};

export default CurrentTariff;
