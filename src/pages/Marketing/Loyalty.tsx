import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import {
  getClientById,
  getClientLoyaltyStats,
  assignCard,
  getCards,
  GetCardsPayload,
} from '@/services/api/marketing';
import { Row, Col, Card, Typography, Alert, Spin, Select, Button, message, Tooltip } from 'antd';
import { useUser } from '@/hooks/useUserStore';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/context/useContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Loyalty: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const { showToast } = useToast();

  const [searchParams] = useSearchParams();
  const [selectedCardId, setSelectedCardId] = useState<number | undefined>(
    undefined
  );
  const [isAssigningCard, setIsAssigningCard] = useState(false);

  const clientId = searchParams.get('userId');
  const userId = clientId ? Number(clientId) : undefined;

  const {
    data: clientData,
    error: clientError,
    isLoading: clientLoading,
  } = useSWR(
    clientId ? [`get-client-by-id`, Number(clientId)] : null,
    () => getClientById(Number(clientId!)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
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
      shouldRetryOnError: false,
    }
  );

  const cardParams: GetCardsPayload = useMemo(
    () => ({
      organizationId: user.organizationId,
      unnasigned: true,
    }),
    [user.organizationId]
  );

  const { data: cards } = useSWR(
    ['get-cards', cardParams],
    ([, params]) => getCards(params),
    {
      shouldRetryOnError: false,
    }
  );

  const allCards = useMemo(() => {
    if (!clientData?.card) return cards || [];
    const exists = (cards || []).some(c => c.id === clientData.card?.id);
    return exists ? cards || [] : [...(cards || []), clientData.card];
  }, [cards, clientData]);

  useEffect(() => {
    if (clientData?.card?.id) {
      setSelectedCardId(clientData.card.id);
    } else {
      setSelectedCardId(undefined);
    }
  }, [clientData]);

  const handleAssignCard = async () => {
    if (!userId || !selectedCardId) {
      message.error('Client ID or Card ID not found');
      return;
    }

    if (clientData?.card?.id === selectedCardId) {
      message.info(
        t('marketing.cardAlreadyAssigned') ||
        'This card is already assigned to the client'
      );
      return;
    }

    setIsAssigningCard(true);
    try {
      await assignCard({
        cardId: selectedCardId,
        clientId: userId,
      });

      showToast(
        t('marketing.cardAssigned') || 'Card assigned successfully',
        'success'
      );
      setSelectedCardId(undefined);
      mutate([`get-client-by-id`, userId]);
      if (user.organizationId) {
        mutate(
          (key) =>
            Array.isArray(key) &&
            key[0] === 'user-key-stats' &&
            key[1] === user.organizationId &&
            (key[2] === userId || key[2] === String(userId)),
          undefined,
          { revalidate: true }
        );
      }
      mutate(
        (key) =>
          Array.isArray(key) &&
          key[0] === 'get-client-loyalty-stats' &&
          (key[1] === userId || key[1] === String(userId)),
        undefined,
        { revalidate: true }
      );
    } catch (error) {
      console.error('Failed to assign card:', error);
      showToast(
        t('marketing.cardAssignError') || 'Failed to assign card',
        'error'
      );
    } finally {
      setIsAssigningCard(false);
    }
  };

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

  const progressPercentage =
    loyaltyStats.amountToNextTier > 0
      ? Math.min(
        (loyaltyStats.accumulatedAmount / loyaltyStats.amountToNextTier) *
        100,
        100
      )
      : 100;

  const filledBars = Math.max(1, Math.round((progressPercentage / 100) * 20));

  return (
    <div className="px-4 md:px-0">
      <Row gutter={[16, 16]} className="flex-wrap">
        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <Card className="rounded-2xl shadow-card  h-full">
            <Title
              level={4}
              className="text-text01 mb-3 md:mb-4 text-sm md:text-base"
            >
              {t('marketing.loyalty')}
            </Title>

            <div className="mb-3">
              <Text type="secondary" className="text-xs md:text-sm">
                {t('marketing.card')}
              </Text>
              <Tooltip
                title={
                  clientData?.card?.balance && clientData.card.balance > 0
                    ? t('marketing.cannotReassignCardWithBalance') ||
                    'Cannot reassign the card since balance is positive'
                    : ''
                }
              >
                <Select
                  className="w-full mt-1"
                  placeholder={t('marketing.selectCard')}
                  value={selectedCardId ? String(selectedCardId) : undefined}
                  onChange={val => setSelectedCardId(val ? Number(val) : undefined)}
                  allowClear={false}
                  size="small"
                  disabled={
                    clientData?.card?.balance !== undefined &&
                    clientData.card.balance > 0
                  }
                >
                  {allCards.map(card => (
                    <Option key={String(card.id)} value={String(card.id)}>
                      {card.number}
                    </Option>
                  ))}
                </Select>
              </Tooltip>
              {selectedCardId &&
                selectedCardId !== clientData?.card?.id &&
                (!clientData?.card?.balance || clientData.card.balance === 0) && (
                  <Button
                    type="primary"
                    onClick={handleAssignCard}
                    htmlType="button"
                    className="w-full mt-2"
                    loading={isAssigningCard}
                    disabled={isAssigningCard}
                    size="small"
                  >
                    {t('marketing.assignCard') || 'Assign Card'}
                  </Button>
                )}
            </div>

            <div className="mb-3">
              <Text type="secondary" className="text-xs md:text-sm">
                {t('marketing.un')}
              </Text>
              <div className="border border-borderFill rounded-md px-2 py-1 mt-1 text-text01 text-xs md:text-sm">
                {loyaltyStats.cardDevNumber || '-'}
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
          <Card className="rounded-2xl shadow-card  h-full">
            <Title
              level={4}
              className="text-text01 mb-3 md:mb-4 text-sm md:text-base"
            >
              {t('marketing.purchase')}
            </Title>

            <Text className="text-xs font-semibold text-text01">
              {t('marketing.detail')}
            </Text>

            <Row justify="space-between" className="my-2">
              <Col className="w-16 md:w-20">
                <Title
                  level={5}
                  className="text-text01 m-0 text-xs md:text-sm"
                >
                  {loyaltyStats.accumulatedAmount.toLocaleString()}
                </Title>
                <Text className="text-xs">
                  {t('marketing.acc')}
                </Text>
              </Col>
              <Col className="w-20 md:w-28">
                <div className="text-end">
                  <Title
                    level={5}
                    className="text-text01 m-0 text-xs md:text-sm"
                  >
                    {loyaltyStats.amountToNextTier.toLocaleString()}
                  </Title>
                  <Text className="text-xs">
                    {t('marketing.until')}
                  </Text>
                </div>
              </Col>
            </Row>

            <div className="flex justify-between mt-2 w-full">
              {Array.from({ length: 20 }).map((_, index) => {
                const isFilled = index < filledBars;
                return (
                  <div
                    key={index}
                    className={`flex-1 h-4 md:h-5 rounded-sm mr-0.5 last:mr-0 ${isFilled ? 'bg-primary02/30' : 'bg-background07'
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
                <div>
                  <Text className="text-xs font-semibold">
                    {loyaltyStats.currentTierName || t('marketing.newbie')}
                  </Text>
                </div>
                <div>
                  <Text className="text-xs">
                    {t('marketing.current')}
                  </Text>
                </div>
              </Col>
              <Col className="text-end">
                <div>
                  <Text className="text-[12px] font-semibold">
                    {loyaltyStats.nextTierName || t('marketing.amateur')}
                  </Text>
                </div>
                <div>
                  <Text className="text-xs">
                    {t('marketing.next')}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <Card className="rounded-2xl shadow-card h-full">
            <Title
              level={4}
              className="text-text01 mb-3 md:mb-4 text-sm md:text-base"
            >
              {t('marketing.balance')}
            </Title>

            <Text className="text-xs font-semibold text-text01">
              {t('marketing.detail')}
            </Text>

            <div className="mb-3">
              <div className=" text-text01 text-xs md:text-sm mt-3">
                {loyaltyStats.activeBonuses.toLocaleString()}
              </div>
              <Text type="secondary" className="text-xs md:text-sm">
                {t('marketing.balance')}
              </Text>
            </div>

            <div className="mb-3">
              <div className=" text-text01 text-xs md:text-sm mt-3">
                {loyaltyStats.totalBonusEarned.toLocaleString()} ₽
              </div>
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
