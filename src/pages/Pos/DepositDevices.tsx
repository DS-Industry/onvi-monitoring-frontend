import React, { useEffect, useMemo, useRef, useState } from 'react';

// utils
import useSWR from 'swr';
import { getCountries } from '@/services/api/countries';
import { DepositResponse, getDepositPos } from '@/services/api/pos';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  formatNumber,
  getCurrencyRender,
  getDateRender,
  getFractionalCurrencyRender,
} from '@/utils/tableUnits';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import {
  formatIdsParam,
  parseIdsParam,
  updateSearchParams,
} from '@/utils/searchParamsUtils';

// components
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import CountryFilterMulti from '@/components/ui/Filter/CountryFilterMulti';
import CityFilterMulti from '@/components/ui/Filter/CityFilterMulti';
import PosFilterMulti from '@/components/ui/Filter/PosFilterMulti';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';

import { Link } from 'react-router-dom';

import { InputNumber, Select, Table } from 'antd';

// types
import type { ColumnsType } from 'antd/es/table';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore';

const DepositDevices: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const user = useUser();
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const cityIds = useMemo(
    () => parseIdsParam(searchParams, 'cityIds'),
    [searchParams.get('cityIds')]
  );
  const posIdsFromUrl = useMemo(
    () => parseIdsParam(searchParams, 'posIds'),
    [searchParams.get('posIds')]
  );
  const countryId = useMemo(() => {
    const raw = searchParams.get('countryId');
    if (!raw) return undefined;
    const id = Number(raw);
    return Number.isNaN(id) ? undefined : id;
  }, [searchParams.get('countryId')]);
  const canFetchDeposits = countryId != null;
  const dateStart =
    searchParams.get('dateStart') ?? new Date().toISOString().slice(0, 10);

  const dateEnd =
    searchParams.get('dateEnd') ?? new Date().toISOString().slice(0, 10);
  const targetCurrencyId = useMemo(() => {
    const raw = searchParams.get('targetCurrencyId');
    if (!raw) return undefined;
    const id = Number(raw);
    return Number.isNaN(id) ? undefined : id;
  }, [searchParams.get('targetCurrencyId')]);
  const conversionRate = useMemo(() => {
    const raw = searchParams.get('currencyRate');
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }, [searchParams.get('currencyRate')]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasInitializedDefaultCountry = useRef(false);

  const resolvedPosIds = useMemo(() => {
    if (posIdsFromUrl.length) return posIdsFromUrl;
    const ownerId = location.state?.ownerId;
    if (ownerId != null) return [Number(ownerId)].filter(id => !Number.isNaN(id));
    return undefined;
  }, [posIdsFromUrl, location.state?.ownerId]);

  const filterParams = useMemo(
    () => ({
      dateStart: new Date(dateStart || `${formattedDate} 00:00`),
      dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
      countryId,
      placementIds: cityIds.length ? cityIds : undefined,
      posIds: resolvedPosIds,
      page: currentPage,
      size: pageSize,
      organizationId: user.organizationId
    }),
    [
      dateStart,
      dateEnd,
      countryId,
      cityIds,
      resolvedPosIds,
      currentPage,
      pageSize,
      formattedDate,
      user.organizationId
    ]
  );

  const swrKey = useMemo(
    () =>
      canFetchDeposits
        ? `get-pos-deposits-${countryId}-${formatIdsParam(cityIds)}-${formatIdsParam(resolvedPosIds ?? [])}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}-${filterParams.organizationId}`
        : null,
    [canFetchDeposits, countryId, filterParams, cityIds, resolvedPosIds]
  );

  const [totalPosesCount, setTotalPosesCount] = useState(0);

  useEffect(() => {
    if (!canFetchDeposits) {
      setTotalPosesCount(0);
      setIsInitialLoading(false);
    }
  }, [canFetchDeposits]);

  // Fetch devices data based on the filter parameters
  const { data: devices, isLoading: filterLoading } = useSWR(
    swrKey,
    () =>
      getDepositPos(filterParams)
        .then(data => {
          setTotalPosesCount(data.totalCount || 0);
          const sorted = [...(data.oper ?? [])].sort((a, b) => a.id - b.id);

          return sorted;
        })
        .finally(() => {
          setIsInitialLoading(false);
        }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { data: countries } = useSWR('get-countries', getCountries, {
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (hasInitializedDefaultCountry.current) return;
    if (!countries) return;

    hasInitializedDefaultCountry.current = true;
    if (countryId != null) return;

    const hasDefaultCountry = countries.some(item => item.id === 1);
    if (!hasDefaultCountry) return;

    updateSearchParams(searchParams, setSearchParams, {
      countryId: '1',
      page: String(DEFAULT_PAGE),
    });
  }, [countries, countryId, searchParams, setSearchParams]);

  const selectedCountry = useMemo(
    () => countries?.find(item => item.id === countryId),
    [countries, countryId]
  );
  const currencyCode = selectedCountry?.currency;
  const sourceCurrencyId = selectedCountry?.currencyId;
  const availableCountryCurrencies = useMemo(() => {
    const uniqueMap = new Map<
      number,
      { currencyId: number; currency: string; symbol?: string }
    >();

    (countries ?? []).forEach(item => {
      if (!uniqueMap.has(item.currencyId)) {
        uniqueMap.set(item.currencyId, {
          currencyId: item.currencyId,
          currency: item.currency,
          symbol: item.symbol,
        });
      }
    });

    return Array.from(uniqueMap.values());
  }, [countries]);
  const targetCurrency = useMemo(
    () =>
      availableCountryCurrencies.find(
        item => item.currencyId === targetCurrencyId
      ),
    [availableCountryCurrencies, targetCurrencyId]
  );
  const targetCurrencyOptions = useMemo(
    () =>
      availableCountryCurrencies
        .filter(item => item.currencyId !== sourceCurrencyId)
        .map(item => ({
          label: item.symbol
            ? `${item.currency} (${item.symbol})`
            : item.currency,
          value: String(item.currencyId),
        })),
    [availableCountryCurrencies, sourceCurrencyId]
  );
  const isConversionActive = Boolean(
    targetCurrency && conversionRate && conversionRate > 0
  );
  const displayCurrencyCode = useMemo(() => {
    const code = isConversionActive ? targetCurrency?.currency : currencyCode;
    if (code == null) return undefined;
    return String(code);
  }, [isConversionActive, targetCurrency?.currency, currencyCode]);
  const monetaryFields = [
    'cashSum',
    'virtualSum',
    'onviSum',
    'legalOperSum',
    'optiSum',
    'yandexSum',
    'mobileSum',
    'cardSum',
    'cashbackSumMub',
    'discountSum',
    'receiptAverage',
  ];
  const convertedDevices = useMemo<DepositResponse[] | undefined>(() => {
    if (!devices || !isConversionActive || !conversionRate) return devices;

    return devices.map(item => {
      const convertedItem = { ...item } as DepositResponse & Record<string, unknown>;
      monetaryFields.forEach(field => {
        const value = convertedItem[field];
        if (typeof value === 'number') {
          convertedItem[field] = value * conversionRate;
        }
      });
      return convertedItem;
    });
  }, [devices, isConversionActive, conversionRate]);

  const currencyRender = useMemo(
    () => getCurrencyRender(displayCurrencyCode),
    [displayCurrencyCode]
  );
  const currencyFractionalRender = useMemo(
    () => getFractionalCurrencyRender(displayCurrencyCode),
    [displayCurrencyCode]
  );
  const dateRender = getDateRender();

  const columns: ColumnsType<DepositResponse> = useMemo(
    () => [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('equipment.name'),
      dataIndex: 'name',
      key: 'name',
      filters: [],
      onFilter: (value, record) => record.name === value,
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/station/enrollments/devices',
              search: `?posId=${record.id || '*'}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: t('pos.city'),
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: t('deposit.columns.lastOperation'),
      dataIndex: 'lastOper',
      key: 'lastOper',
      render: dateRender,
      sorter: (a, b) =>
        new Date(a.lastOper).getTime() - new Date(b.lastOper).getTime(),
    },
    {
      title: t('deposit.columns.cash'),
      dataIndex: 'cashSum',
      key: 'cashSum',
      render: currencyFractionalRender,
    },
    {
      title: t('deposit.columns.cashless'),
      dataIndex: 'virtualSum',
      key: 'virtualSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.onviSum'),
      dataIndex: 'onviSum',
      key: 'onviSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.legalOperSum'),
      dataIndex: 'legalOperSum',
      key: 'legalOperSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.optiSum'),
      dataIndex: 'optiSum',
      key: 'optiSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.operationsCount'),
      dataIndex: 'counter',
      key: 'counter',
      sorter: (a, b) => a.counter - b.counter,
      render: (_value, record) => formatNumber(record.counter),
    },
    {
      title: t('deposit.columns.yandexSum'),
      dataIndex: 'yandexSum',
      key: 'yandexSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.cardSum'),
      dataIndex: 'cardSum',
      key: 'cardSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.discountSum'),
      dataIndex: 'discountSum',
      key: 'discountSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.carCount'),
      dataIndex: 'carCount',
      key: 'carCount',
      sorter: (a, b) => (a.carCount || 0) - (b.carCount || 0),
      render: (value) => formatNumber(value),
    },
    {
      title: t('deposit.columns.receiptAverage'),
      dataIndex: 'receiptAverage',
      key: 'receiptAverage',
      sorter: (a, b) => (a.receiptAverage || 0) - (b.receiptAverage || 0),
      render: currencyRender,
    },
  ],
    [t, currencyRender, currencyFractionalRender, dateRender, dateStart, dateEnd]
  );

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'pos-deposits-table-columns');

  const calculateTotals = () => {
    if (!convertedDevices || convertedDevices.length === 0) return null;

    const totals: any = {
      id: 'total-row',
      name: t('finance.total'),
      city: '',
      lastOper: '',
      cashSum: 0,
      virtualSum: 0,
      onviSum: 0,
      legalOperSum: 0,
      optiSum: 0,
      yandexSum: 0,
      counter: 0,
      mobileSum: 0,
      cardSum: 0,
      cashbackSumMub: 0,
      discountSum: 0,
      carCount: 0,
      receiptAverage: 0,
    };

    convertedDevices.forEach(item => {
      const row = item as DepositResponse & Record<string, number | undefined>;
      totals.cashSum += row.cashSum || 0;
      totals.virtualSum += row.virtualSum || 0;
      totals.onviSum += row.onviSum || 0;
      totals.legalOperSum += row.legalOperSum || 0;
      totals.optiSum += row.optiSum || 0;
      totals.yandexSum += row.yandexSum || 0;
      totals.counter += row.counter || 0;
      totals.mobileSum += row.mobileSum || 0;
      totals.cardSum += row.cardSum || 0;
      totals.cashbackSumMub += row.cashbackSumMub || 0;
      totals.discountSum += row.discountSum || 0;
      totals.carCount += row.carCount || 0;
    });

    return totals;
  };

  const totalsRow = calculateTotals();

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.deposits')}
        </span>
      </div>

      <GeneralFilters count={totalPosesCount} display={['dateTime']}>
        <CountryFilterMulti />
        <CityFilterMulti countryParamKey="countryId" />
        <PosFilterMulti />
      </GeneralFilters>

      <div className="mt-8">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('deposit.columns.currency')}
            </label>
            <Select
              disabled
              className="w-full"
              options={
                currencyCode
                  ? [{ label: currencyCode, value: currencyCode }]
                  : undefined
              }
              value={currencyCode}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('deposit.converter.toCurrency')}
            </label>
            <Select
              allowClear
              className="w-full"
              disabled={!currencyCode}
              options={targetCurrencyOptions}
              placeholder={t('deposit.converter.selectCurrency')}
              value={
                targetCurrencyId != null ? String(targetCurrencyId) : undefined
              }
              onChange={value => {
                updateSearchParams(searchParams, setSearchParams, {
                  targetCurrencyId: value || undefined,
                });
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('deposit.converter.rate')}
            </label>
            <InputNumber
              min={0}
              step={0.0001}
              className="w-full"
              disabled={!targetCurrencyId}
              placeholder="0.0000"
              value={conversionRate}
              onChange={value => {
                updateSearchParams(searchParams, setSearchParams, {
                  currencyRate: value ? String(value) : undefined,
                });
              }}
            />
          </div>
        </div>

        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          rowKey="id"
          dataSource={canFetchDeposits ? convertedDevices : []}
          columns={visibleColumns}
          scroll={{ x: 'max-content' }}
          loading={canFetchDeposits && (filterLoading || isInitialLoading)}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalPosesCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              });
            },
          }}
          summary={() => {
            if (!totalsRow) return null;
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  {visibleColumns.map((col, index) => {
                    const dataIndex = 'dataIndex' in col ? (col.dataIndex as string) : undefined;
                    let value: React.ReactNode = '';

                    if (index === 0) {
                      return (
                        <Table.Summary.Cell key={col.key?.toString() || index} index={index}>
                          <span className="font-bold">{t('finance.total')}</span>
                        </Table.Summary.Cell>
                      );
                    }

                    if (dataIndex && totalsRow[dataIndex] !== undefined) {
                      if (dataIndex === 'receiptAverage') {
                        value = '';
                      } else if (dataIndex === 'cashSum') {
                        value = currencyFractionalRender(totalsRow[dataIndex]);
                      } else if (
                        ['virtualSum', 'onviSum', 'legalOperSum', 'optiSum', 'yandexSum', 'mobileSum', 'cardSum', 'cashbackSumMub', 'discountSum'].includes(dataIndex)
                      ) {
                        value = currencyRender(totalsRow[dataIndex]);
                      } else if (dataIndex === 'counter') {
                        value = formatNumber(totalsRow[dataIndex]);
                      } else if (dataIndex === 'carCount') {
                        value = formatNumber(totalsRow[dataIndex]);
                      } else {
                        value = '';
                      }
                    }

                    return (
                      <Table.Summary.Cell key={col.key?.toString() || index} index={index}>
                        <span className="font-bold">{value}</span>
                      </Table.Summary.Cell>
                    );
                  })}
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
    </>
  );
};

export default DepositDevices;
