import React, { useMemo } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { Alert, Empty, Select, Spin } from 'antd';
import LineChart from '@/components/ui/LineChart';
import {
  getStationDepositsRefunds,
  getStationLoyaltyVisits,
  getStationPlanFactSummary,
  getStationRevenueSeries,
  getStationServiceStructure,
  getStationSummary,
} from '@/services/api/pos/overview';
import { formatNumber } from '@/utils/tableUnits';
import OverviewKpiCard from '../components/OverviewKpiCard';
import HorizontalBarList from '../components/HorizontalBarList';
import GoalConversionBar from '../components/GoalConversionBar';
import { formatCompactMoney } from '../hooks/useOverviewFilters';
import { useOverviewCurrency } from '../hooks/OverviewCurrencyContext';
import { getGoalStatus } from '../utils/goalStatus';

type OverviewTabProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
};

const OverviewTab: React.FC<OverviewTabProps> = ({
  posId,
  dateStart,
  dateEnd,
}) => {
  const { t } = useTranslation();
  const { convert, displayCurrencySymbol } = useOverviewCurrency();
  const dateRange = { dateStart, dateEnd };

  const { data: summary, isLoading: summaryLoading, error: summaryError } =
    useSWR(
      ['pos-overview-station-summary', posId, dateStart, dateEnd],
      () => getStationSummary(posId, dateRange),
      { shouldRetryOnError: false, revalidateOnFocus: false }
    );

  const {
    data: series,
    isLoading: seriesLoading,
    error: seriesError,
  } = useSWR(
    ['pos-overview-revenue-series', posId, dateStart, dateEnd],
    () => getStationRevenueSeries(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const {
    data: structure,
    isLoading: structureLoading,
    error: structureError,
  } = useSWR(
    ['pos-overview-service-structure', posId, dateStart, dateEnd],
    () => getStationServiceStructure(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const { data: planFact } = useSWR(
    ['pos-overview-station-plan-for-conversion', posId, dateStart, dateEnd],
    () => getStationPlanFactSummary(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const {
    data: loyaltyVisits,
    isLoading: visitsLoading,
    error: visitsError,
  } = useSWR(
    ['pos-overview-loyalty-visits', posId, dateStart, dateEnd],
    () => getStationLoyaltyVisits(posId, dateRange),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      dedupingInterval: 120_000,
    }
  );

  const {
    data: depositsRefunds,
    isLoading: refundsLoading,
    error: refundsError,
  } = useSWR(
    ['pos-overview-deposits-refunds', posId, dateStart, dateEnd],
    () => getStationDepositsRefunds(posId, dateRange),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      dedupingInterval: 120_000,
    }
  );

  const chartData =
    series?.points?.map(p => ({
      date: new Date(p.date),
      sum: convert(p.sum) ?? p.sum,
    })) ?? [];

  const goal = useMemo(
    () =>
      getGoalStatus(planFact?.fulfillmentPercent, dateStart, dateEnd),
    [planFact?.fulfillmentPercent, dateStart, dateEnd]
  );

  const error =
    summaryError ||
    seriesError ||
    structureError ||
    visitsError ||
    refundsError;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <OverviewKpiCard
          label={t('posOverview.revenueMtd')}
          value={formatCompactMoney(
            convert(summary?.revenue),
            displayCurrencySymbol
          )}
          loading={summaryLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.refundSum')}
          value={formatCompactMoney(
            convert(depositsRefunds?.refundSum),
            displayCurrencySymbol
          )}
          loading={refundsLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.carsWashed')}
          value={formatNumber(summary?.carsWashed)}
          loading={summaryLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.onviVisits')}
          value={formatNumber(loyaltyVisits?.onviVisits)}
          loading={visitsLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.cardVisits')}
          value={formatNumber(loyaltyVisits?.cardVisits)}
          loading={visitsLoading}
        />
      </div>

      <div className="mb-3 text-base font-semibold text-text01">
        {t('posOverview.revenueDynamicsDays')}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-base font-semibold text-text01">
            {t('posOverview.revenueChart')}
          </div>
          <Select
            disabled
            size="small"
            className="min-w-[160px]"
            placeholder={t('posOverview.allWashes')}
            options={[]}
          />
        </div>
        <Spin spinning={seriesLoading}>
          {chartData.length === 0 && !seriesLoading ? (
            <Empty description={t('table.noData')} />
          ) : (
            <div className="h-72">
              <LineChart revenueData={chartData} />
            </div>
          )}
        </Spin>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Spin spinning={structureLoading}>
          <HorizontalBarList
            title={t('posOverview.serviceStructure')}
            emptyText={t('table.noData')}
            showBullet
            items={
              structure?.items?.map(item => ({
                key: item.name,
                label: item.name,
                value: item.sharePercent,
                displayValue: `${formatNumber(item.sharePercent, 'double')}%`,
                maxScale: 100,
              })) ?? []
            }
          />
        </Spin>

        <GoalConversionBar
          goal={goal}
          showFactGoal
          factLabel={`${formatNumber(goal.conversionPercent, 'double')}% ${t('posOverview.fact').toLowerCase()}`}
          goalLabel={`${t('posOverview.goal').toLowerCase()} 100%`}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
