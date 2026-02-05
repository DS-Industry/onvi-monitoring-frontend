import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getCardsPaginated, GetCardsPaginatedPayload } from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import { Spin, Card as AntCard, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Card: React.FC = () => {
  const { t } = useTranslation();
  const { cardId: cardIdParam } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const user = useUser();

  const cardId = cardIdParam ? Number(cardIdParam) : undefined;

  const cardParams: GetCardsPaginatedPayload = React.useMemo(
    () => ({
      organizationId: user.organizationId!,
      page: 1,
      size: 1000,
    }),
    [user.organizationId]
  );

  const { data: cardsData, isLoading } = useSWR(
    user.organizationId && cardId
      ? ['get-cards-paginated-detail', cardParams, cardId]
      : null,
    ([, params]) => getCardsPaginated(params),
    {
      shouldRetryOnError: false,
    }
  );

  const card = cardsData?.cards.find(c => c.id === cardId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Text>{t('marketing.cardNotFound') || 'Card not found'}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="flex text-primary02 mb-5 cursor-pointer"
        onClick={() => navigate('/marketing/cards')}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>

      <div className="font-semibold text-text01 text-2xl mb-6">
        {t('marketing.card')}
      </div>

      <AntCard className="max-w-2xl">
        <div className="space-y-4">
          <div>
            <Text className="text-text02 text-sm">{t('marketing.cardNumber')}:</Text>
            <Title level={4} className="mt-1 mb-0">
              {card.number}
            </Title>
          </div>

          {card.unqNumber && (
            <div>
              <Text className="text-text02 text-sm">{t('marketing.uniqueCardNumber')}:</Text>
              <Title level={4} className="mt-1 mb-0">
                {card.unqNumber}
              </Title>
            </div>
          )}

          <div>
            <Text className="text-text02 text-sm">{t('marketing.type')}:</Text>
            <Title level={4} className="mt-1 mb-0">
              {card.type === 'VIRTUAL' ? t('marketing.virtual') || 'Virtual' : t('marketing.physical') || 'Physical'}
            </Title>
          </div>

          <div>
            <Text className="text-text02 text-sm">{t('marketing.balance')}:</Text>
            <Title level={4} className="mt-1 mb-0">
              {card.balance.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 2,
              })}
            </Title>
          </div>

          {card.cardTier && (
            <div>
              <Text className="text-text02 text-sm">{t('marketing.level')}:</Text>
              <Title level={4} className="mt-1 mb-0">
                {card.cardTier.name}
              </Title>
              <Text className="text-text02 text-sm">
                {t('marketing.discount')} {Math.floor(card.cardTier.limitBenefit)}%
              </Text>
            </div>
          )}

          <div>
            <Text className="text-text02 text-sm">{t('marketing.isCorporate')}:</Text>
            <Title level={4} className="mt-1 mb-0">
              {card.isCorporate ? t('equipment.yes') : t('equipment.no')}
            </Title>
          </div>
        </div>
      </AntCard>
    </div>
  );
};

export default Card;
