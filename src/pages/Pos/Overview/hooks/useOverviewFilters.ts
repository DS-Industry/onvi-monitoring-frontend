import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { parseIdsParam } from '@/utils/searchParamsUtils';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

export function useOverviewDateRange() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const today = dayjs();
    const dateStart =
      searchParams.get('dateStart') ??
      today.startOf('day').format('YYYY-MM-DDTHH:mm');
    const dateEnd =
      searchParams.get('dateEnd') ??
      today.endOf('day').format('YYYY-MM-DDTHH:mm');

    return { dateStart, dateEnd };
  }, [searchParams]);
}

export function useOverviewNetworkFilters(organizationId?: number) {
  const [searchParams] = useSearchParams();
  const { dateStart, dateEnd } = useOverviewDateRange();

  return useMemo(() => {
    const countryRaw = searchParams.get('countryId');
    const countryId = countryRaw ? Number(countryRaw) : undefined;
    const cityIds = parseIdsParam(searchParams, 'cityIds');
    const search = searchParams.get('search') || undefined;
    const page = Number(searchParams.get('page') || DEFAULT_PAGE);
    const size = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

    return {
      dateStart,
      dateEnd,
      organizationId,
      countryId: countryId != null && !Number.isNaN(countryId) ? countryId : undefined,
      placementIds: cityIds.length ? cityIds : undefined,
      search,
      page,
      size,
    };
  }, [searchParams, dateStart, dateEnd, organizationId]);
}

export function formatCompactMoney(
  value: number | null | undefined,
  currencySymbol = '₽'
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('ru-RU', {
      maximumFractionDigits: 2,
    })}M ${currencySymbol}`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toLocaleString('ru-RU', {
      maximumFractionDigits: 0,
    })}k ${currencySymbol}`;
  }
  return `${value.toLocaleString('ru-RU')} ${currencySymbol}`;
}
