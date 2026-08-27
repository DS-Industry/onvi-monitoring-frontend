import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GetCardByIdResponse } from '@/services/api/marketing';

type ClientCardTileProps = {
  card: GetCardByIdResponse;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

function formatBalance(balance: number) {
  return balance.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  });
}

const ClientCardTile: React.FC<ClientCardTileProps> = ({
  card,
  selected = false,
  compact = false,
  onClick,
}) => {
  const { t } = useTranslation();
  const discountValue = Math.floor(
    card.limitBenefit ?? card.cardTier?.limitBenefit ?? 0
  );
  const tierName = card.cardTier?.name;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl px-5 flex flex-col justify-between bg-primary02 text-white transition-shadow w-full ${
        compact ? 'py-3 min-h-[100px]' : 'py-4 min-h-[120px]'
      } ${
        selected
          ? 'ring-2 ring-offset-2 ring-primary02 shadow-lg'
          : 'shadow-sm hover:shadow-md'
      }`}
    >
      <div className="text-sm font-normal text-white/85">
        {tierName
          ? `${t('marketing.mainCard')} | ${tierName}`
          : t('marketing.mainCard')}
      </div>
      <div
        className={`font-semibold tracking-wide my-2 ${
          compact ? 'text-xl' : 'text-2xl my-3'
        }`}
      >
        {card.number}
      </div>
      <div className="flex justify-between items-end gap-3 text-sm">
        <span>
          {t('marketing.discount')} {discountValue}%
        </span>
        <span className="font-medium">{formatBalance(card.balance)}</span>
      </div>
    </button>
  );
};

export default ClientCardTile;
