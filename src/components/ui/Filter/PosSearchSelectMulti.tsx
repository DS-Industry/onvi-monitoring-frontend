import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from 'antd';
import useSWR from 'swr';
import { getPoses } from '@/services/api/equipment';
import { useDebouncedSearch } from './useDebouncedSearch';

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
}) => {
  const { debouncedSearch, debouncedSearchUpdate, resetSearch } = useDebouncedSearch();
  const [pinned, setPinned] = useState<Map<number, string>>(new Map());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const placementKey = placementIds?.join(',') ?? String(placementId ?? '');

  useEffect(() => {
    resetSearch();
    setPinned(new Map());
  }, [placementKey, organizationId, resetSearch]);

  const { data: posData, isLoading } = useSWR(
    organizationId
      ? ['get-pos-search-multi', placementKey, organizationId, debouncedSearch]
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
    () => value.filter(id => !posData?.some(p => p.id === id) && !pinned.has(id)),
    [value, posData, pinned]
  );

  const { data: pinnedData } = useSWR(
    organizationId && missingIds.length
      ? ['get-pos-pinned-multi', placementKey, organizationId, missingIds.join(',')]
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
    if (!pinnedData) return;

    setPinned(prev => {
      const next = new Map(prev);
      pinnedData.forEach(p => next.set(p.id, p.name));
      return next;
    });

    const valid = new Set(pinnedData.map(p => p.id));
    const pruned = value.filter(id => !missingIds.includes(id) || valid.has(id));
    if (pruned.length !== value.length) onChangeRef.current(pruned);
  }, [pinnedData, missingIds, value]);

  const options = useMemo(() => {
    const items = (posData || []).map(p => ({ label: p.name, value: p.id }));
    pinned.forEach((name, id) => {
      if (!items.some(o => o.value === id)) items.push({ label: name, value: id });
    });
    return items;
  }, [posData, pinned]);

  const handleChange = (values: number[]) => {
    resetSearch();
    setPinned(prev => {
      const next = new Map<number, string>();
      values.forEach(id => {
        const label =
          posData?.find(p => p.id === id)?.name ??
          prev.get(id) ??
          options.find(o => o.value === id)?.label;
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
