import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Skeleton } from 'antd';
import type { GetCardByIdResponse } from '@/services/api/marketing';
import CardDetailsPanel from './CardDetailsPanel';
import ClientCardTile from './ClientCardTile';
import ClientCardTileSkeleton from './ClientCardTileSkeleton';

type CardClientCardsTabProps = {
  clientId?: number;
  routeCardId: number;
  fallbackCard: GetCardByIdResponse;
  clientCards?: GetCardByIdResponse[];
  cardsLoading?: boolean;
  loyaltyProgramId?: number;
};

const CardClientCardsTab: React.FC<CardClientCardsTabProps> = ({
  clientId,
  routeCardId,
  fallbackCard,
  clientCards,
  cardsLoading = false,
  loyaltyProgramId,
}) => {
  const { t } = useTranslation();

  const filteredCards = useMemo(() => {
    if (!clientCards) return [];
    if (!loyaltyProgramId) return clientCards;
    return clientCards.filter((c) => c.cardTier?.ltyProgramId === loyaltyProgramId);
  }, [clientCards, loyaltyProgramId]);

  const [selectedCardId, setSelectedCardId] = useState(routeCardId);

  useEffect(() => {
    setSelectedCardId(routeCardId);
  }, [routeCardId]);

  useEffect(() => {
    if (!filteredCards.length) return;
    const stillPresent = filteredCards.some((c) => c.id === selectedCardId);
    if (!stillPresent) {
      setSelectedCardId(filteredCards[0].id);
    }
  }, [filteredCards, selectedCardId]);

  const selectedCard = useMemo(() => {
    if (!clientId) return fallbackCard;
    return (
      filteredCards.find((c) => c.id === selectedCardId) ??
      filteredCards[0] ??
      fallbackCard
    );
  }, [clientId, filteredCards, selectedCardId, fallbackCard]);

  if (!clientId) {
    return <CardDetailsPanel cardId={routeCardId} card={fallbackCard} />;
  }

  if (cardsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-lg font-semibold text-text01">
          {t('marketing.clientCards')}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClientCardTileSkeleton count={4} />
        </div>
        <div className="border-t pt-4 space-y-3">
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-lg font-semibold text-text01">
          {t('marketing.clientCards')}
        </div>
        <Empty description={t('table.noData')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-text01">
        {t('marketing.clientCards')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCards.map((item) => (
          <ClientCardTile
            key={item.id}
            card={item}
            selected={item.id === selectedCardId}
            onClick={() => setSelectedCardId(item.id)}
          />
        ))}
      </div>

      {filteredCards.length > 0 && (
        <div className="border-t pt-4">
          <CardDetailsPanel
            cardId={selectedCard.id}
            card={selectedCard}
            clientId={clientId}
          />
        </div>
      )}
    </div>
  );
};

export default CardClientCardsTab;
