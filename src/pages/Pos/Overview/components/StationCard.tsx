import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudOutlined } from '@ant-design/icons';
import { formatNumber } from '@/utils/tableUnits';
import type { NetworkCardItem } from '@/services/api/pos/overview';
import { getGoalStatus } from '../utils/goalStatus';
import StatusBadge from './StatusBadge';
import GoalConversionBar from './GoalConversionBar';

type StationCardProps = {
  item: NetworkCardItem;
  dateStart: string;
  dateEnd: string;
  currencySymbol?: string;
  onClick: () => void;
};

const StationCard: React.FC<StationCardProps> = ({
  item,
  dateStart,
  dateEnd,
  currencySymbol = '₽',
  onClick,
}) => {
  const { t } = useTranslation();

  const goal = useMemo(
    () => getGoalStatus(item.planFulfillmentPercent, dateStart, dateEnd),
    [item.planFulfillmentPercent, dateStart, dateEnd]
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full text-left rounded-xl bg-white shadow-sm border border-borderFill/60 p-5 hover:shadow-card transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-base font-semibold text-text01 truncate">
            {item.name}
          </div>
          <div className="text-sm text-text02 mt-0.5">{item.city || '—'}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge
            status={goal.status}
            color={goal.color}
            bgColor={goal.bgColor}
          />
          <div className="flex items-center gap-1 text-xs text-text02">
            <CloudOutlined className="text-[12px]" />
            <span>—°</span>
            <span className="text-borderFill">|</span>
            <span>—</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
        <div>
          <div className="text-xs text-text02 mb-1">
            {t('posOverview.carsWashed')}
          </div>
          <div className="text-lg font-semibold text-text01">
            {formatNumber(item.carsWashed)}
          </div>
        </div>
        <div>
          <div className="text-xs text-text02 mb-1">
            {t('posOverview.revenueMtd')}
          </div>
          <div className="text-lg font-semibold text-text01">
            {formatNumber(item.revenue)} {currencySymbol}
          </div>
        </div>
        <div>
          <div className="text-xs text-text02 mb-1">
            {t('posOverview.planCompleted')}
          </div>
          <div className="text-lg font-semibold text-text01">
            {formatNumber(item.planFulfillmentPercent, 'double')}%
          </div>
        </div>
        <div>
          <div className="text-xs text-text02 mb-1">
            {t('posOverview.downtime')}
          </div>
          <div className="text-lg font-semibold text-text01">—</div>
        </div>
      </div>

      <GoalConversionBar goal={goal} compact />
    </button>
  );
};

export default StationCard;
