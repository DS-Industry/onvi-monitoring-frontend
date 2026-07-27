import React, { useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Empty, Pagination, Spin } from 'antd';
import { getCountries } from '@/services/api/countries';
import {
  getNetworkCards,
  getNetworkSummary,
} from '@/services/api/pos/overview';
import { useUser } from '@/hooks/useUserStore';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { formatNumber } from '@/utils/tableUnits';
import { ALL_PAGE_SIZES, DEFAULT_PAGE } from '@/utils/constants';
import CountryFilterMulti from '@/components/ui/Filter/CountryFilterMulti';
import CityFilterMulti from '@/components/ui/Filter/CityFilterMulti';
import SearchInputFilter from '@/components/ui/Filter/SearchInputFilter';
import OverviewKpiCard from './components/OverviewKpiCard';
import StationCard from './components/StationCard';
import PeriodToggle from './components/PeriodToggle';
import CurrencyConverterBar from './components/CurrencyConverterBar';
import {
  formatCompactMoney,
  useOverviewNetworkFilters,
} from './hooks/useOverviewFilters';
import { useCurrencyConversion } from './hooks/useCurrencyConversion';

const PosOverviewNetwork: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useOverviewNetworkFilters(user.organizationId);
  const conversion = useCurrencyConversion();
  const canFetch = filters.countryId != null;
  const hasInitializedDefaultCountry = useRef(false);
  const hasInitializedDates = useRef(false);

  const { data: countries } = useSWR(['get-countries'], () => getCountries(), {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (hasInitializedDefaultCountry.current) return;
    if (!countries?.length) return;
    hasInitializedDefaultCountry.current = true;
    if (searchParams.get('countryId')) return;

    const defaultCountry = countries.find(c => c.id === 1) ?? countries[0];
    if (defaultCountry) {
      updateSearchParams(searchParams, setSearchParams, {
        countryId: String(defaultCountry.id),
        page: String(DEFAULT_PAGE),
      });
    }
  }, [countries, searchParams, setSearchParams]);

  useEffect(() => {
    if (hasInitializedDates.current) return;
    if (searchParams.get('dateStart') && searchParams.get('dateEnd')) {
      hasInitializedDates.current = true;
      return;
    }
    hasInitializedDates.current = true;

    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    updateSearchParams(searchParams, setSearchParams, {
      dateStart: fmt(start),
      dateEnd: fmt(end),
    });
  }, [searchParams, setSearchParams]);

  const summaryKey = useMemo(
    () =>
      canFetch
        ? [
            'pos-overview-network-summary',
            filters.dateStart,
            filters.dateEnd,
            filters.organizationId,
            filters.countryId,
            filters.placementIds?.join(','),
            filters.search,
          ]
        : null,
    [canFetch, filters]
  );

  const cardsKey = useMemo(
    () =>
      canFetch
        ? [
            'pos-overview-network-cards',
            filters.dateStart,
            filters.dateEnd,
            filters.organizationId,
            filters.countryId,
            filters.placementIds?.join(','),
            filters.search,
            filters.page,
            filters.size,
          ]
        : null,
    [canFetch, filters]
  );

  const { data: summary, isLoading: summaryLoading, error: summaryError } =
    useSWR(summaryKey, () => getNetworkSummary(filters), {
      shouldRetryOnError: false,
      keepPreviousData: true,
      revalidateOnFocus: false,
    });

  const { data: cards, isLoading: cardsLoading, error: cardsError } = useSWR(
    cardsKey,
    () => getNetworkCards(filters),
    {
      shouldRetryOnError: false,
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const handleCardClick = (posId: number, name: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('posName', name);
    params.delete('page');
    params.delete('size');
    params.delete('search');
    navigate(`/station/enrollments/${posId}?${params.toString()}`);
  };

  const error = summaryError || cardsError;

  return (
    <div className="px-2 md:px-0">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="text-xl sm:text-3xl font-semibold text-text01 m-0">
          {t('posOverview.networkTitle')}
        </h1>
        <div className="flex flex-wrap items-end gap-3">
          <SearchInputFilter className="w-full sm:w-48" />
          <CityFilterMulti
            countryParamKey="countryId"
            className="w-full sm:w-44"
            label={t('posOverview.region')}
            placeholder={t('posOverview.allRegions')}
          />
          <CountryFilterMulti className="w-full sm:w-44" />
        </div>
      </div>

      <div className="mb-5">
        <PeriodToggle />
      </div>

      <div className="mb-5">
        <CurrencyConverterBar conversion={conversion} />
      </div>

      {!canFetch ? (
        <Alert
          type="info"
          showIcon
          message={t('posOverview.selectCountry')}
          className="mb-4"
        />
      ) : null}

      {error ? (
        <Alert
          type="error"
          showIcon
          message={t('posOverview.loadError')}
          className="mb-4"
        />
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <OverviewKpiCard
          label={t('posOverview.revenueMtd')}
          value={formatCompactMoney(
            conversion.convert(summary?.revenue),
            conversion.displayCurrencySymbol
          )}
          loading={summaryLoading}
          delta="—"
        />
        <OverviewKpiCard
          label={t('posOverview.carsWashed')}
          value={formatNumber(summary?.carsWashed)}
          loading={summaryLoading}
          delta="—"
        />
        <OverviewKpiCard
          label={t('posOverview.planFulfillment')}
          value={`${formatNumber(summary?.planFulfillmentPercent, 'double')}%`}
          loading={summaryLoading}
          delta="—"
        />
        <OverviewKpiCard
          label={t('posOverview.downtimeMonth')}
          value="—"
          loading={summaryLoading}
          delta="—"
        />
      </div>

      <Spin spinning={cardsLoading}>
        {!cardsLoading && (!cards?.items || cards.items.length === 0) ? (
          <Empty description={t('table.noData')} className="py-12" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards?.items?.map(item => (
              <StationCard
                key={item.id}
                item={{
                  ...item,
                  revenue: conversion.convert(item.revenue) ?? item.revenue,
                }}
                dateStart={filters.dateStart}
                dateEnd={filters.dateEnd}
                currencySymbol={conversion.displayCurrencySymbol}
                onClick={() => handleCardClick(item.id, item.name)}
              />
            ))}
          </div>
        )}
      </Spin>

      {(cards?.totalCount ?? 0) > 0 ? (
        <div className="mt-6 flex justify-end">
          <Pagination
            current={filters.page}
            pageSize={filters.size}
            total={cards?.totalCount ?? 0}
            showSizeChanger
            pageSizeOptions={ALL_PAGE_SIZES}
            onChange={(page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page,
                size,
              });
            }}
            onShowSizeChange={(_page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: DEFAULT_PAGE,
                size,
              });
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default PosOverviewNetwork;
