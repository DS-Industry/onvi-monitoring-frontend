import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { debounce } from 'lodash';
import { getPoses } from '@/services/api/equipment';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore.ts';

const PAGE_SIZE = 10;

const PosFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const placementId = Number(searchParams.get('city')) || undefined;
  const posIdParam = getParam(searchParams, 'posId');
  const selectedPosId = posIdParam ? Number(posIdParam) : undefined;
  const user = useUser();

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>();

  const debouncedSearchUpdate = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value.trim()), 300),
    []
  );

  useEffect(() => () => debouncedSearchUpdate.cancel(), [debouncedSearchUpdate]);

  useEffect(() => {
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');
    setSelectedLabel(undefined);
  }, [placementId, debouncedSearchUpdate]);

  const { data: posData, isLoading } = useSWR(
    user.organizationId ? ['get-pos', placementId, user.organizationId, debouncedSearch] : null,
    () =>
      getPoses({
        placementId,
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

  const { data: selectedPosData } = useSWR(
    user.organizationId && selectedPosId && !posData?.some(p => p.id === selectedPosId)
      ? ['get-pos-selected', placementId, user.organizationId, selectedPosId]
      : null,
    () =>
      getPoses({
        placementId,
        organizationId: user.organizationId!,
        posIds: [selectedPosId!],
      }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (!selectedPosId) {
      setSelectedLabel(undefined);
      return;
    }
    const match = posData?.find(p => p.id === selectedPosId) ?? selectedPosData?.[0];
    if (match) {
      setSelectedLabel(match.name);
      return;
    }
    if (selectedPosData?.length === 0) {
      updateSearchParams(searchParams, setSearchParams, {
        posId: undefined,
        page: DEFAULT_PAGE,
      });
    }
  }, [selectedPosId, posData, selectedPosData, searchParams, setSearchParams]);

  const options = useMemo(() => {
    const items = (posData || []).map(item => ({
      label: item.name,
      value: String(item.id),
    }));
    if (selectedPosId && selectedLabel && !items.some(o => o.value === String(selectedPosId))) {
      items.push({ label: selectedLabel, value: String(selectedPosId) });
    }
    return items;
  }, [posData, selectedPosId, selectedLabel]);

  const handleChange = (val: string | undefined) => {
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');
    setSelectedLabel(val ? options.find(o => o.value === val)?.label : undefined);
    updateSearchParams(searchParams, setSearchParams, {
      posId: val,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.posId')}
      </label>
      <Select
        showSearch
        allowClear
        placeholder={t('filters.pos.placeholder')}
        value={posIdParam}
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

export default PosFilter;
