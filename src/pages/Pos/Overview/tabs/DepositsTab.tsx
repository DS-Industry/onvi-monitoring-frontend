import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Empty, Pagination, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DepositsTableItem,
  getDepositsComparison,
  getDepositsTable,
  getStationDepositsSummary,
} from '@/services/api/pos/overview';
import { useUser } from '@/hooks/useUserStore';
import { formatNumber } from '@/utils/tableUnits';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import OverviewKpiCard from '../components/OverviewKpiCard';
import HorizontalBarList from '../components/HorizontalBarList';
import StackedCompositionBar from '../components/StackedCompositionBar';
import PeriodToggle from '../components/PeriodToggle';
import {
  formatCompactMoney,
  useOverviewNetworkFilters,
} from '../hooks/useOverviewFilters';
import { useOverviewCurrency } from '../hooks/OverviewCurrencyContext';

type DepositsTabProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
};

type DepositsMode = 'this' | 'comparison';

const DepositsTab: React.FC<DepositsTabProps> = ({
  posId,
  dateStart,
  dateEnd,
}) => {
  const { t } = useTranslation();
  const user = useUser();
  const { convert, displayCurrencySymbol } = useOverviewCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = (searchParams.get('depositsMode') as DepositsMode) || 'this';
  const networkFilters = useOverviewNetworkFilters(user.organizationId);
  const page = Number(searchParams.get('depPage') || DEFAULT_PAGE);
  const size = Number(searchParams.get('depSize') || DEFAULT_PAGE_SIZE);

  const dateRange = { dateStart, dateEnd };

  const setMode = (next: DepositsMode) => {
    updateSearchParams(searchParams, setSearchParams, {
      depositsMode: next,
      depPage: DEFAULT_PAGE,
    });
  };

  const fullTableHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('dateStart', dateStart);
    params.set('dateEnd', dateEnd);
    if (networkFilters.countryId != null) {
      params.set('countryId', String(networkFilters.countryId));
    }
    if (networkFilters.placementIds?.length) {
      params.set('cityIds', networkFilters.placementIds.join(','));
    }
    params.set('posIds', String(posId));
    return `/station/enrollments/table?${params.toString()}`;
  }, [dateStart, dateEnd, networkFilters, posId]);

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSWR(
    mode === 'this'
      ? ['pos-overview-deposits-summary', posId, dateStart, dateEnd]
      : null,
    () => getStationDepositsSummary(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const comparisonParams = useMemo(
    () => ({
      ...networkFilters,
      dateStart,
      dateEnd,
      page: undefined,
      size: undefined,
      search: undefined,
    }),
    [networkFilters, dateStart, dateEnd]
  );

  const {
    data: comparison,
    isLoading: comparisonLoading,
    error: comparisonError,
  } = useSWR(
    mode === 'comparison'
      ? [
          'pos-overview-deposits-comparison',
          dateStart,
          dateEnd,
          networkFilters.organizationId,
          networkFilters.countryId,
          networkFilters.placementIds?.join(','),
        ]
      : null,
    () => getDepositsComparison(comparisonParams),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const tableParams = useMemo(
    () => ({
      ...comparisonParams,
      page,
      size,
      sortBy: 'amount' as const,
    }),
    [comparisonParams, page, size]
  );

  const {
    data: tableData,
    isLoading: tableLoading,
    error: tableError,
  } = useSWR(
    mode === 'comparison'
      ? [
          'pos-overview-deposits-table',
          dateStart,
          dateEnd,
          networkFilters.organizationId,
          networkFilters.countryId,
          networkFilters.placementIds?.join(','),
          page,
          size,
        ]
      : null,
    () => getDepositsTable(tableParams),
    { shouldRetryOnError: false, revalidateOnFocus: false, keepPreviousData: true }
  );

  // Station composition: fetch single-pos row from table for cash/cashless split
  const stationRowParams = useMemo(
    () => ({
      ...networkFilters,
      dateStart,
      dateEnd,
      posIds: [posId],
      page: 1,
      size: 1,
      search: undefined,
    }),
    [networkFilters, dateStart, dateEnd, posId]
  );

  const { data: stationRowData } = useSWR(
    mode === 'this'
      ? [
          'pos-overview-deposits-station-row',
          posId,
          dateStart,
          dateEnd,
          networkFilters.countryId,
        ]
      : null,
    () => getDepositsTable(stationRowParams),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const stationRow = stationRowData?.items?.[0];
  const cashSum = stationRow?.cashSum;
  const cashlessSum =
    stationRow != null
      ? (stationRow.virtualSum || 0) +
        (stationRow.cardSum || 0) +
        (stationRow.onviSum || 0) +
        (stationRow.yandexSum || 0)
      : undefined;

  const columns: ColumnsType<DepositsTableItem> = [
    {
      title: t('posOverview.station'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('posOverview.city'),
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: t('deposit.columns.cash'),
      dataIndex: 'cashSum',
      key: 'cashSum',
      render: (v: number) => formatNumber(convert(v)),
    },
    {
      title: t('deposit.columns.cashless'),
      dataIndex: 'virtualSum',
      key: 'virtualSum',
      render: (v: number) => formatNumber(convert(v)),
    },
    {
      title: t('deposit.columns.onviSum'),
      dataIndex: 'onviSum',
      key: 'onviSum',
      render: (v: number) => formatNumber(convert(v)),
    },
    {
      title: t('deposit.columns.yandexSum'),
      dataIndex: 'yandexSum',
      key: 'yandexSum',
      render: (v: number) => formatNumber(convert(v)),
    },
    {
      title: t('deposit.columns.cardSum'),
      dataIndex: 'cardSum',
      key: 'cardSum',
      render: (v: number) => formatNumber(convert(v)),
    },
    {
      title: t('deposit.columns.operationsCount'),
      dataIndex: 'operationsCount',
      key: 'operationsCount',
      render: (v: number) => formatNumber(v),
    },
  ];

  const error = summaryError || comparisonError || tableError;

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
        <Link to={fullTableHref} className="text-sm text-primary02 pb-2">
          {t('posOverview.goToFullTable')}
        </Link>
      </div>

      {mode === 'this' ? (
        <div className="mb-5">
          <PeriodToggle />
        </div>
      ) : null}

      {error ? (
        <Alert
          type="error"
          showIcon
          message={t('posOverview.loadError')}
          className="mb-4"
        />
      ) : null}

      {mode === 'this' ? (
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
            emptyText={t('table.noData')}
            currencySymbol={displayCurrencySymbol}
            segments={
              cashSum != null || cashlessSum != null
                ? [
                    {
                      key: 'cashless',
                      label: t('posOverview.cashless'),
                      value: convert(cashlessSum) ?? 0,
                      color: '#9C4DBA',
                    },
                    {
                      key: 'cash',
                      label: t('posOverview.cash'),
                      value: convert(cashSum) ?? 0,
                      color: '#00B359',
                    },
                  ]
                : [
                    {
                      key: 'cashless',
                      label: t('posOverview.cashless'),
                      value: 0,
                      color: '#9C4DBA',
                    },
                    {
                      key: 'cash',
                      label: t('posOverview.cash'),
                      value: 0,
                      color: '#00B359',
                    },
                  ]
            }
          />

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-base font-semibold text-text01 mb-3">
              {t('posOverview.loyaltyCards')}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-text02">
                {t('posOverview.loyaltyCardsAccrued')}
              </span>
              <span className="font-semibold text-text01">—</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Spin spinning={comparisonLoading}>
            <HorizontalBarList
              title={t('posOverview.depositsComparison')}
              emptyText={t('table.noData')}
              items={
                comparison?.items?.map(item => ({
                  key: String(item.posId),
                  label: item.name,
                  value: convert(item.totalSum) ?? item.totalSum,
                  displayValue: formatCompactMoney(
                    convert(item.totalSum),
                    displayCurrencySymbol
                  ),
                })) ?? []
              }
            />
          </Spin>

          <Spin spinning={tableLoading}>
            {!tableData?.items?.length && !tableLoading ? (
              <Empty description={t('table.noData')} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-5 overflow-x-auto">
                <Table
                  rowKey="posId"
                  columns={columns}
                  dataSource={tableData?.items ?? []}
                  pagination={false}
                  scroll={{ x: true }}
                />
              </div>
            )}
          </Spin>

          {(tableData?.totalCount ?? 0) > 0 ? (
            <div className="flex justify-end">
              <Pagination
                current={page}
                pageSize={size}
                total={tableData?.totalCount ?? 0}
                showSizeChanger
                pageSizeOptions={ALL_PAGE_SIZES}
                onChange={(nextPage, nextSize) => {
                  updateSearchParams(searchParams, setSearchParams, {
                    depPage: nextPage,
                    depSize: nextSize,
                  });
                }}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DepositsTab;
