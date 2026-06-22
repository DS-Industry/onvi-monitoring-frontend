import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { debounce } from 'lodash';
import { getPoses } from '@/services/api/equipment';
import { parseIdsParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';

const PAGE_SIZE = 10;

const PosFilterMulti: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const cityIds = parseIdsParam(searchParams, 'cityIds');
  const posIds = parseIdsParam(searchParams, 'posIds');
  const cityIdsKey = cityIds.join(',');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<Map<number, string>>(new Map());
  const prevCityIdsKeyRef = useRef(cityIdsKey);

  const debouncedSearchUpdate = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value.trim()), 300),
    []
  );

  useEffect(() => () => debouncedSearchUpdate.cancel(), [debouncedSearchUpdate]);

  useEffect(() => {
    if (prevCityIdsKeyRef.current === cityIdsKey) return;
    prevCityIdsKeyRef.current = cityIdsKey;
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');
    setSelectedLabels(new Map());
    updateSearchParams(searchParams, setSearchParams, {
      posIds: undefined,
      page: DEFAULT_PAGE,
    });
  }, [cityIdsKey, debouncedSearchUpdate, searchParams, setSearchParams]);

  const { data: posData, isLoading } = useSWR(
    cityIds.length && user.organizationId
      ? ['get-pos-multi', cityIdsKey, user.organizationId, debouncedSearch]
      : null,
    () =>
      getPoses({
        placementIds: cityIds,
        organizationId: user.organizationId!,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const missingIds = useMemo(
    () => posIds.filter(id => !posData?.some(p => p.id === id) && !selectedLabels.has(id)),
    [posIds, posData, selectedLabels]
  );

  const { data: pinnedPosData } = useSWR(
    cityIds.length && user.organizationId && missingIds.length
      ? ['get-pos-multi-pinned', cityIdsKey, user.organizationId, missingIds.join(',')]
      : null,
    () =>
      getPoses({
        placementIds: cityIds,
        organizationId: user.organizationId!,
        posIds: missingIds,
      }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (!pinnedPosData) return;

    setSelectedLabels(prev => {
      const next = new Map(prev);
      pinnedPosData.forEach(p => next.set(p.id, p.name));
      return next;
    });

    const validIds = new Set(pinnedPosData.map(p => p.id));
    const pruned = posIds.filter(id => !missingIds.includes(id) || validIds.has(id));
    if (pruned.length !== posIds.length) {
      updateSearchParams(searchParams, setSearchParams, {
        posIds: pruned.length ? pruned : undefined,
        page: DEFAULT_PAGE,
      });
    }
  }, [pinnedPosData, missingIds, posIds, searchParams, setSearchParams]);

  const options = useMemo(() => {
    const items = (posData || []).map(item => ({
      label: item.name,
      value: String(item.id),
    }));
    selectedLabels.forEach((name, id) => {
      if (!items.some(o => o.value === String(id))) {
        items.push({ label: name, value: String(id) });
      }
    });
    return items;
  }, [posData, selectedLabels]);

  const handleChange = (values: string[]) => {
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');
    const selected = values.map(v => Number(v)).filter(id => !Number.isNaN(id));
    setSelectedLabels(prev => {
      const next = new Map<number, string>();
      selected.forEach(id => {
        const label =
          posData?.find(p => p.id === id)?.name ??
          prev.get(id) ??
          options.find(o => o.value === String(id))?.label;
        if (label) next.set(id, label);
      });
      return next;
    });
    updateSearchParams(searchParams, setSearchParams, {
      posIds: selected.length ? selected : undefined,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.posId')}
      </label>
      <Select
        mode="multiple"
        showSearch
        allowClear
        disabled={cityIds.length === 0}
        placeholder={t('filters.pos.placeholder')}
        value={posIds.map(String)}
        onChange={handleChange}
        loading={isLoading}
        className="w-full"
        options={options}
        filterOption={false}
        onSearch={debouncedSearchUpdate}
      />
    </div>
  );
};

export default PosFilterMulti;
