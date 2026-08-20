import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { GetCardByIdResponse } from '@/services/api/marketing';
import ClientCardTile from './ClientCardTile';
import ClientCardTileSkeleton from './ClientCardTileSkeleton';

type CardClientCardsTabProps = {
  clientId?: number;
  routeCardId: number;
  fallbackCard: GetCardByIdResponse;
  clientCards?: GetCardByIdResponse[];
  cardsLoading: boolean;
  loyaltyProgramId?: number;
};

const CardClientCardsTab: React.FC<CardClientCardsTabProps> = ({
  clientId,
  fallbackCard,
  clientCards,
  cardsLoading,
  loyaltyProgramId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filteredCards = useMemo(() => {
    if (!clientCards) return [];
    if (!loyaltyProgramId) return clientCards;
    return clientCards.filter((c) => c.cardTier?.ltyProgramId === loyaltyProgramId);
  }, [clientCards, loyaltyProgramId]);

  const displayCards = clientId ? filteredCards : [fallbackCard];

  if (!clientId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/marketing/cards')}
          >
            {t('common.back')}
          </Button>
          <span className="text-lg font-semibold">{t('marketing.clientCards')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClientCardTile card={fallbackCard} />
        </div>
      </div>
    );
  }

  if (cardsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{t('marketing.clientCards')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClientCardTileSkeleton />
          <ClientCardTileSkeleton />
        </div>
      </div>
    );
  }

  if (!displayCards.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{t('marketing.clientCards')}</span>
        </div>
        <Empty description={t('marketing.noCardsFound')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{t('marketing.clientCards')}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayCards.map((card) => (
          <ClientCardTile key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default CardClientCardsTab;
