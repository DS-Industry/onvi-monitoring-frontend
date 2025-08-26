import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getClientById, getClientLoyaltyStats } from '@/services/api/marketing';
import { Row, Col, Card, Typography, Alert } from 'antd';
import {
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useUser } from '@/hooks/useUserStore';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

const Loyalty: React.FC = () => {
  const { t } = useTranslation();

  const user = useUser();
    
  const [searchParams] = useSearchParams();

  const clientId = searchParams.get('userId')

  const { data: clientData, error: clientError, isLoading: clientLoading } = useSWR(
    clientId ? [`get-client-by-id`, clientId] : null,
    () => getClientById(Number(clientId!)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: loyaltyStats, error: loyaltyError, isLoading: loyaltyLoading } = useSWR(
    clientId && clientData ? [`get-client-loyalty-stats`, clientId, clientData] : null,
    () => getClientLoyaltyStats({
      clientId: clientData?.id || 0,
      organizationId: user?.organizationId || 0,
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  if (!clientId) {
    return (
      <Alert
        message="No Client ID"
        description="Please provide a client ID in the URL parameters"
        type="warning"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (clientLoading || loyaltyLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading client loyalty data...</div>
      </div>
    );
  }

  if (clientError || loyaltyError) {
    return (
      <Alert
        message="Error"
        description="Failed to load client loyalty data"
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (!clientData || !loyaltyStats) {
    return (
      <Alert
        message="No Data"
        description="No client loyalty data available"
        type="info"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  const progressPercentage = loyaltyStats.amountToNextTier > 0 
    ? Math.min((loyaltyStats.accumulatedAmount / (loyaltyStats.accumulatedAmount + loyaltyStats.amountToNextTier)) * 100, 100)
    : 100;

  return (
    <>
      <Row gutter={[24, 24]} className="flex-wrap">
        <Col xs={24} md={12} lg={8}>
          <Card className="rounded-2xl shadow-card h-80">
            <Title level={4} className="text-text01 mb-4">
              {t('marketing.loyalty')}
            </Title>

            <div className="mb-3">
              <Text type="secondary" className="text-sm">
                {t('marketing.card')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01">
                {loyaltyStats.cardDevNumber || '-'}
              </div>
            </div>

            <div className="mb-3">
              <Text type="secondary" className="text-sm">
                {t('marketing.un')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01">
                {loyaltyStats.cardNumber || '-'}
              </div>
            </div>

            <div>
              <Text type="secondary" className="text-sm">
                {t('equipment.start')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 w-32 text-text01">
                {clientData.createdAt ? new Date(clientData.createdAt).toLocaleDateString('ru-RU') : 'N/A'}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="rounded-2xl shadow-card h-80">
            <Title level={4} className="text-text01 mb-4">
              {t('marketing.purchase')}
            </Title>

            <Text className="text-xs font-semibold text-text01">
              {t('marketing.detail')}
            </Text>
            <Row justify="space-between" className="my-2">
              <Col className="w-20">
                <Title level={5} className="text-text01 m-0">
                  {loyaltyStats.accumulatedAmount.toLocaleString()}
                </Title>
                <Text className="text-sm text-text02">
                  {t('marketing.acc')}
                </Text>
              </Col>
              <Col className="w-28">
                <div className="text-end">
                  <Title level={5} className="text-text01 m-0">
                    {loyaltyStats.amountToNextTier.toLocaleString()}
                  </Title>
                  <Text className="text-sm text-text02">
                    {t('marketing.until')}
                  </Text>
                </div>
              </Col>
            </Row>

            <div className="flex space-x-1.5 mt-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-5 ${
                    index < Math.floor((progressPercentage / 100) * 20) 
                      ? 'bg-primary02/30' 
                      : 'bg-background07'
                  }`}
                />
              ))}
            </div>

            <Row justify="space-between" className="mt-6">
              <Col>
                <Text className="text-lg font-semibold text-text01">
                  {loyaltyStats.currentTierName || t('marketing.newbie')}
                </Text>
                <div className="text-sm text-text02">
                  {t('marketing.current')}
                </div>
              </Col>
              <Col className="text-end">
                <Text className="text-lg font-semibold text-text01">
                  {loyaltyStats.nextTierName || t('marketing.amateur')}
                </Text>
                <div className="text-sm text-text02">{t('marketing.next')}</div>
              </Col>
            </Row>

            <Row align="middle" className="mt-6 space-x-2">
              <ClockCircleOutlined className="text-primary02 text-lg" />
              <Text className="text-primary02 font-semibold">
                {t('marketing.accrual')}
              </Text>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="rounded-2xl shadow-card h-80">
            <Title level={4} className="text-text01 mb-4">
              {t('marketing.bonus')}
            </Title>

            <div className="mb-3">
              <Text type="secondary" className="text-sm">
                {t('marketing.active')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01">
                {loyaltyStats.activeBonuses.toLocaleString()}
              </div>
            </div>

            <div className="mb-3">
              <Text type="secondary" className="text-sm">
                {t('marketing.total')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01">
                {loyaltyStats.totalBonusEarned.toLocaleString()}
              </div>
            </div>

            <div>
              <Text type="secondary" className="text-sm">
                {t('marketing.purchase')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01">
                {loyaltyStats.totalPurchaseAmount.toLocaleString()}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Loyalty;
