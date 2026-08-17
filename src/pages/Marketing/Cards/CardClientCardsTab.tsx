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
};

const CardClientCardsTab: React.FC<CardClientCardsTabProps> = ({
  clientId,
  routeCardId,
  fallbackCard,
  clientCards,
  cardsLoading = false,
}) => {
  const { t } = useTranslation();
  const [selectedCardId, setSelectedCardId] = useState(routeCardId);

  useEffect(() => {
    setSelectedCardId(routeCardId);
  }, [routeCardId]);

  useEffect(() => {
    if (!clientCards?.length) return;
    const stillPresent = clientCards.some(c => c.id === selectedCardId);
    if (!stillPresent) {
      setSelectedCardId(clientCards[0].id);
    }
  }, [clientCards, selectedCardId]);

  const selectedCard = useMemo(() => {
    if (!clientId) return fallbackCard;
    return (
      clientCards?.find(c => c.id === selectedCardId) ??
      clientCards?.[0] ??
      fallbackCard
    );
  }, [clientId, clientCards, selectedCardId, fallbackCard]);

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

  const cards = clientCards ?? [];

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-text01">
        {t('marketing.clientCards')}
      </div>

      {cards.length === 0 ? (
        <Empty description={t('table.noData')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(item => (
            <ClientCardTile
              key={item.id}
              card={item}
              selected={item.id === selectedCardId}
              onClick={() => setSelectedCardId(item.id)}
            />
          ))}
        </div>
      )}

      {cards.length > 0 ? (
        <div className="border-t pt-4">
          <CardDetailsPanel
            cardId={selectedCard.id}
            card={selectedCard}
            clientId={clientId}
          />
        </div>
      ) : null}
    </div>
  );
};

export default CardClientCardsTab;
