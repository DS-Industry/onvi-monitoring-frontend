import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getClientById, getClientLoyaltyStats } from '@/services/api/marketing';
import { Row, Col, Card, Typography, Alert, Spin } from 'antd';
import { useUser } from '@/hooks/useUserStore';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

const Loyalty: React.FC = () => {
  const { t } = useTranslation();

  const user = useUser();

  const [searchParams] = useSearchParams();

  const clientId = searchParams.get('userId');

  const {
    data: clientData,
    error: clientError,
    isLoading: clientLoading,
  } = useSWR(
    clientId ? [`get-client-by-id`, clientId] : null,
    () => getClientById(Number(clientId!)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const {
    data: loyaltyStats,
    error: loyaltyError,
    isLoading: loyaltyLoading,
  } = useSWR(
    clientId && clientData
      ? [`get-client-loyalty-stats`, clientId, clientData]
      : null,
    () =>
      getClientLoyaltyStats({
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
      <div className="px-4 md:px-0">
        <Alert
          message="No Client ID"
          description="Please provide a client ID in the URL parameters"
          type="warning"
          showIcon
          className="my-4 md:my-5"
        />
      </div>
    );
  }

  if (clientLoading || loyaltyLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (clientError || loyaltyError) {
    return (
      <div className="px-4 md:px-0">
        <Alert
          message="Error"
          description="Failed to load client loyalty data"
          type="error"
          showIcon
          className="my-4 md:my-5"
        />
      </div>
    );
  }

  if (!clientData || !loyaltyStats) {
    return (
      <div className="px-4 md:px-0">
        <Alert
          message="No Data"
          description="No client loyalty data available"
          type="info"
          showIcon
          className="my-4 md:my-5"
        />
      </div>
    );
  }

  const progressPercentage = loyaltyStats.amountToNextTier > 0
    ? Math.min((loyaltyStats.accumulatedAmount / loyaltyStats.amountToNextTier) * 100, 100)
    : 100;

  const filledBars = Math.max(1, Math.round((progressPercentage / 100) * 20));

  return (
    <div className="px-4 md:px-0">
      <Row gutter={[16, 16]} className="flex-wrap">
        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <Card className="rounded-2xl shadow-card h-64 sm:h-72 md:h-80">
            <Title level={4} className="text-text01 mb-3 md:mb-4 text-base md:text-lg">
              {t('marketing.loyalty')}
            </Title>

            <div className="mb-3">
              <Text type="secondary" className="text-xs md:text-sm">
                {t('marketing.card')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01 text-xs md:text-sm">
                {loyaltyStats.cardDevNumber || '-'}
              </div>
            </div>

            <div className="mb-3">
              <Text type="secondary" className="text-xs md:text-sm">
                {t('marketing.un')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01 text-xs md:text-sm">
                {loyaltyStats.cardNumber || '-'}
              </div>
            </div>

            <div>
              <Text type="secondary" className="text-xs md:text-sm">
                {t('equipment.start')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 w-24 md:w-32 text-text01 text-xs md:text-sm">
                {clientData.createdAt
                  ? new Date(clientData.createdAt).toLocaleDateString('ru-RU')
                  : 'N/A'}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <Card className="rounded-2xl shadow-card h-64 sm:h-72 md:h-80">
            <Title level={4} className="text-text01 mb-3 md:mb-4 text-base md:text-lg">
              {t('marketing.purchase')}
            </Title>

            <Text className="text-xs font-semibold text-text01">
              {t('marketing.detail')}
            </Text>
            
            <Row justify="space-between" className="my-2">
              <Col className="w-16 md:w-20">
                <Title level={5} className="text-text01 m-0 text-sm md:text-base">
                  {loyaltyStats.accumulatedAmount.toLocaleString()}
                </Title>
                <Text className="text-xs md:text-sm text-text02">
                  {t('marketing.acc')}
                </Text>
              </Col>
              <Col className="w-20 md:w-28">
                <div className="text-end">
                  <Title level={5} className="text-text01 m-0 text-sm md:text-base">
                    {loyaltyStats.amountToNextTier.toLocaleString()}
                  </Title>
                  <Text className="text-xs md:text-sm text-text02">
                    {t('marketing.until')}
                  </Text>
                </div>
              </Col>
            </Row>

            <div className="flex space-x-1 md:space-x-1.5 mt-2">
              {Array.from({ length: 20 }).map((_, index) => {
                const isFilled = index < filledBars;
                return (
                  <div
                    key={index}
                    className={`w-2 md:w-2.5 h-4 md:h-5 rounded-sm ${
                      isFilled ? 'bg-primary02/30' : 'bg-background07'
                    }`}
                    title={`Bar ${index + 1}: ${isFilled ? 'Filled' : 'Empty'}`}
                  />
                );
              })}
            </div>
            
            <div className="mt-2 text-center">
              <Text className="text-xs text-text02">
                {Math.round(progressPercentage)}% {t('marketing.complete')}
              </Text>
            </div>

            <Row justify="space-between" className="mt-4 md:mt-6">
              <Col>
                <Text className="text-base md:text-lg font-semibold text-text01">
                  {loyaltyStats.currentTierName || t('marketing.newbie')}
                </Text>
                <div className="text-xs md:text-sm text-text02">
                  {t('marketing.current')}
                </div>
              </Col>
              <Col className="text-end">
                <Text className="text-base md:text-lg font-semibold text-text01">
                  {loyaltyStats.nextTierName || t('marketing.amateur')}
                </Text>
                <div className="text-xs md:text-sm text-text02">{t('marketing.next')}</div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <Card className="rounded-2xl shadow-card h-64 sm:h-72 md:h-80">
            <Title level={4} className="text-text01 mb-3 md:mb-4 text-base md:text-lg">
              {t('marketing.balance')}
            </Title>

            <Text className="text-xs font-semibold text-text01">
              {t('marketing.detail')}
            </Text>

            <div className="mb-3">
              <div className=" text-text01 text-xs md:text-sm mt-3">{loyaltyStats.activeBonuses.toLocaleString()}</div>
              <Text type="secondary" className="text-xs md:text-sm">
                {t('marketing.balance')}
              </Text>
            </div>

            <div className="mb-3">
              <div className=" text-text01 text-xs md:text-sm mt-3">{loyaltyStats.totalBonusEarned.toLocaleString()} ₽</div>
              <Text type="secondary" className="text-xs md:text-sm">
                {t('marketing.accr')}
              </Text>
              
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Loyalty;
