import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from 'antd';
import {
  getStationPlanFactProgress,
  getStationPlanFactSummary,
} from '@/services/api/pos/overview';
import { formatNumber } from '@/utils/tableUnits';
import OverviewKpiCard from '../components/OverviewKpiCard';
import { formatCompactMoney } from '../hooks/useOverviewFilters';
import { useOverviewCurrency } from '../hooks/OverviewCurrencyContext';
import { getGoalStatus } from '../utils/goalStatus';

type PlanFactTabProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
};

const PlanFactTab: React.FC<PlanFactTabProps> = ({
  posId,
  dateStart,
  dateEnd,
}) => {
  const { t } = useTranslation();
  const { convert, displayCurrencySymbol } = useOverviewCurrency();
  const dateRange = { dateStart, dateEnd };

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSWR(
    ['pos-overview-plan-fact-summary', posId, dateStart, dateEnd],
    () => getStationPlanFactSummary(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useSWR(
    ['pos-overview-plan-fact-progress', posId, dateStart, dateEnd],
    () => getStationPlanFactProgress(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const fullTableHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('dateStart', dateStart);
    params.set('dateEnd', dateEnd);
    params.set('posId', String(posId));
    return `/station/plan/act?${params.toString()}`;
  }, [dateStart, dateEnd, posId]);

  const error = summaryError || progressError;
  const fulfillment =
    progress?.fulfillmentPercent ?? summary?.fulfillmentPercent ?? 0;
  const notCompleted =
    progress?.notCompletedPercent ?? Math.max(0, 100 - fulfillment);

  const goal = useMemo(
    () => getGoalStatus(fulfillment, dateStart, dateEnd),
    [fulfillment, dateStart, dateEnd]
  );

  return (
    <div>
      {error ? (
        <Alert
          type="error"
          showIcon
          message={t('posOverview.loadError')}
          className="mb-4"
        />
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OverviewKpiCard
          label={t('posOverview.planForMonth')}
          value={formatCompactMoney(
            convert(summary?.plan),
            displayCurrencySymbol
          )}
          loading={summaryLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.fact')}
          value={formatCompactMoney(
            convert(summary?.fact),
            displayCurrencySymbol
          )}
          loading={summaryLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.planFulfillment')}
          value={`${formatNumber(summary?.fulfillmentPercent, 'double')}%`}
          loading={summaryLoading}
        />
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-base font-semibold text-text01">
          {t('posOverview.planFactProgress')}
        </div>
        <Link to={fullTableHref} className="text-sm text-primary02">
          {t('posOverview.goToFullTable')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(Math.max(Number(fulfillment) || 0, 0), 100)}%`,
              backgroundColor: goal.color === '#00A355' ? '#0B68E1' : goal.color,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-text02">
          <span>
            {progress?.periodLabel || '—'}
            {progressLoading ? ' …' : ''}
          </span>
          <span>
            {t('posOverview.notCompleted').toLowerCase()}{' '}
            {formatNumber(notCompleted, 'double')}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanFactTab;
