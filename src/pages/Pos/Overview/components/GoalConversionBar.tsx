import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/tableUnits';
import type { GoalStatusResult } from '../utils/goalStatus';

type GoalConversionBarProps = {
  goal: GoalStatusResult;
  /** Compact footer style used on station cards */
  compact?: boolean;
  /** Station overview style: show fact / goal labels above the bar */
  showFactGoal?: boolean;
  factLabel?: string;
  goalLabel?: string;
  className?: string;
};

const GoalConversionBar: React.FC<GoalConversionBarProps> = ({
  goal,
  compact = false,
  showFactGoal = false,
  factLabel,
  goalLabel,
  className = '',
}) => {
  const { t } = useTranslation();
  const width = Math.min(Math.max(goal.conversionPercent, 0), 100);

  if (showFactGoal) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
        <div className="text-base font-semibold text-text01 mb-4">
          {t('posOverview.conversionToGoal')}
        </div>
        <div className="mb-2 flex items-center justify-between text-sm text-text02">
          <span>
            {factLabel ??
              `${formatNumber(goal.conversionPercent, 'double')}% ${t('posOverview.fact').toLowerCase()}`}
          </span>
          <span>
            {goalLabel ??
              `${t('posOverview.goal').toLowerCase()} ${formatNumber(goal.expectedPacePercent, 'double')}%`}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(Math.max(goal.conversionPercent, 0), 100)}%`,
              backgroundColor: goal.color,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`${compact ? 'h-1' : 'h-1.5'} w-full rounded-full bg-gray-100 overflow-hidden`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${width}%`,
            backgroundColor: goal.color,
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-text02">
        <span>{t('posOverview.conversionToGoal')}</span>
        <span className="font-medium text-text01">
          {formatNumber(goal.conversionPercent, 'double')}%
        </span>
      </div>
    </div>
  );
};

export default GoalConversionBar;
