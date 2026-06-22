import React, { useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';
import { debounce } from 'lodash';
import useSWR from 'swr';
import { getPoses } from '@/services/api/equipment';

const PAGE_SIZE = 10;

type Props = {
  value?: number[];
  onChange: (value: number[]) => void;
  placementId?: number;
  placementIds?: number[];
  organizationId?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'large' | 'middle' | 'small';
};

const PosSearchSelectMulti: React.FC<Props> = ({
  value = [],
  onChange,
  placementId,
  placementIds,
  organizationId,
  placeholder,
  className,
  disabled,
  size,
}) => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<Map<number, string>>(new Map());

  const debouncedSearchUpdate = useMemo(
    () => debounce((search: string) => setDebouncedSearch(search.trim()), 300),
    []
  );

  useEffect(() => () => debouncedSearchUpdate.cancel(), [debouncedSearchUpdate]);

  const { data: posData, isLoading } = useSWR(
    organizationId
      ? [
          'get-pos-search-select-multi',
          placementId,
          placementIds?.join(','),
          organizationId,
          debouncedSearch,
        ]
      : null,
    () =>
      getPoses({
        placementId,
        placementIds,
        organizationId: organizationId!,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    { revalidateOnFocus: false, keepPreviousData: true, shouldRetryOnError: false }
  );

  const missingIds = useMemo(
    () => value.filter(id => !posData?.some(pos => pos.id === id) && !selectedLabels.has(id)),
    [value, posData, selectedLabels]
  );

  const { data: pinnedPosData } = useSWR(
    organizationId && missingIds.length
      ? [
          'get-pos-search-select-multi-pinned',
          placementId,
          placementIds?.join(','),
          organizationId,
          missingIds.join(','),
        ]
      : null,
    () =>
      getPoses({
        placementId,
        placementIds,
        organizationId: organizationId!,
        posIds: missingIds,
      }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (!pinnedPosData) return;
    setSelectedLabels(prev => {
      const next = new Map(prev);
      pinnedPosData.forEach(pos => next.set(pos.id, pos.name));
      return next;
    });
  }, [pinnedPosData]);

  const options = useMemo(() => {
    const items = (posData || []).map(pos => ({ label: pos.name, value: pos.id }));
    selectedLabels.forEach((name, id) => {
      if (!items.some(item => item.value === id)) {
        items.push({ label: name, value: id });
      }
    });
    return items;
  }, [posData, selectedLabels]);

  const handleChange = (values: number[]) => {
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');
    setSelectedLabels(prev => {
      const next = new Map<number, string>();
      values.forEach(id => {
        const label =
          posData?.find(pos => pos.id === id)?.name ??
          prev.get(id) ??
          options.find(option => option.value === id)?.label;
        if (label) next.set(id, label);
      });
      return next;
    });
    onChange(values);
  };

  return (
    <Select
      mode="multiple"
      showSearch
      allowClear
      disabled={disabled}
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      options={options}
      filterOption={false}
      onSearch={debouncedSearchUpdate}
      loading={isLoading}
      className={className}
    />
  );
};

export default PosSearchSelectMulti;
