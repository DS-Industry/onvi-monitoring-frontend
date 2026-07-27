import React from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from 'antd';
import {
  getStationLoyaltyComposition,
  getStationLoyaltySummary,
} from '@/services/api/pos/overview';
import { formatNumber } from '@/utils/tableUnits';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import OverviewKpiCard from '../components/OverviewKpiCard';
import StackedCompositionBar from '../components/StackedCompositionBar';
import PeriodToggle from '../components/PeriodToggle';
import { formatCompactMoney } from '../hooks/useOverviewFilters';
import { useOverviewCurrency } from '../hooks/OverviewCurrencyContext';

type LoyaltyTabProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
};

type LoyaltyMode = 'this' | 'comparison';

const LoyaltyTab: React.FC<LoyaltyTabProps> = ({
  posId,
  dateStart,
  dateEnd,
}) => {
  const { t } = useTranslation();
  const { convert, displayCurrencySymbol } = useOverviewCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = (searchParams.get('loyaltyMode') as LoyaltyMode) || 'this';
  const dateRange = { dateStart, dateEnd };

  const setMode = (next: LoyaltyMode) => {
    updateSearchParams(searchParams, setSearchParams, { loyaltyMode: next });
  };

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSWR(
    ['pos-overview-loyalty-summary', posId, dateStart, dateEnd],
    () => getStationLoyaltySummary(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const {
    data: composition,
    isLoading: compositionLoading,
    error: compositionError,
  } = useSWR(
    ['pos-overview-loyalty-composition', posId, dateStart, dateEnd],
    () => getStationLoyaltyComposition(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const error = summaryError || compositionError;

  const underlineTab = (active: boolean) =>
    `pb-2 text-sm border-b-2 transition-colors ${
      active
        ? 'text-text01 border-primary02 font-medium'
        : 'text-text02 border-transparent hover:text-text01'
    }`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-borderFill">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setMode('this')}
            className={underlineTab(mode === 'this')}
          >
            {t('posOverview.thisWash')}
          </button>
          <button
            type="button"
            onClick={() => setMode('comparison')}
            className={underlineTab(mode === 'comparison')}
          >
            {t('posOverview.compareAll')}
          </button>
        </div>
        <span className="text-sm text-primary02 pb-2 opacity-50 cursor-default">
          {t('posOverview.goToFullTable')}
        </span>
      </div>

      <div className="mb-5">
        <PeriodToggle />
      </div>

      {error ? (
        <Alert
          type="error"
          showIcon
          message={t('posOverview.loadError')}
          className="mb-4"
        />
      ) : null}

      {mode === 'comparison' ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-text02">
          —
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <OverviewKpiCard
              label={t('posOverview.depositsSum')}
              value={formatCompactMoney(
                convert(summary?.totalSum),
                displayCurrencySymbol
              )}
              loading={summaryLoading}
            />
            <OverviewKpiCard
              label={t('posOverview.operations')}
              value={formatNumber(summary?.operationsCount)}
              loading={summaryLoading}
            />
            <OverviewKpiCard
              label={t('posOverview.averageCheck')}
              value={`${formatNumber(convert(summary?.averageCheck))} ${displayCurrencySymbol}`}
              loading={summaryLoading}
            />
          </div>

          <StackedCompositionBar
            title={t('posOverview.depositsComposition')}
            emptyText={compositionLoading ? '…' : t('table.noData')}
            currencySymbol={displayCurrencySymbol}
            segments={[
              {
                key: 'onvi',
                label: 'ONVI',
                value: convert(composition?.onviSum) ?? 0,
                color: '#9C42B1',
              },
              {
                key: 'yandex',
                label: t('posOverview.yandex'),
                value: convert(composition?.yandexSum) ?? 0,
                color: '#00B35D',
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default LoyaltyTab;
