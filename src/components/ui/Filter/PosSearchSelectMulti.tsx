import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from 'antd';
import useSWR from 'swr';
import { getPoses, PosResponse } from '@/services/api/equipment';
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
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PosResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const placementKey = placementIds?.join(',') ?? String(placementId ?? '');

  useEffect(() => {
    resetSearch();
    setPinned(new Map());
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [placementKey, organizationId, resetSearch]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [debouncedSearch]);

  const { data: posData, isLoading, isValidating } = useSWR(
    organizationId
      ? ['get-pos-search-multi', placementKey, organizationId, debouncedSearch, page]
      : null,
    () =>
      getPoses({
        placementId,
        placementIds,
        organizationId: organizationId!,
        page,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (!posData) return;
    setItems(prev => {
      if (page === 1) return posData;
      const ids = new Set(prev.map(p => p.id));
      return [...prev, ...posData.filter(p => !ids.has(p.id))];
    });
    setHasMore(posData.length >= PAGE_SIZE);
    loadingMoreRef.current = false;
  }, [posData, page]);

  const missingIds = useMemo(
    () => value.filter(id => !items.some(p => p.id === id) && !pinned.has(id)),
    [value, items, pinned]
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
    const mapped = items.map(p => ({ label: p.name, value: p.id }));
    pinned.forEach((name, id) => {
      if (!mapped.some(o => o.value === id)) mapped.push({ label: name, value: id });
    });
    return mapped;
  }, [items, pinned]);

  const handleChange = (values: number[]) => {
    resetSearch();
    setPinned(prev => {
      const next = new Map<number, string>();
      values.forEach(id => {
        const label =
          items.find(p => p.id === id)?.name ??
          prev.get(id) ??
          options.find(o => o.value === id)?.label;
        if (label) next.set(id, label);
      });
      return next;
    });
    onChange(values);
  };

  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight < target.scrollHeight - 16) return;
    if (!hasMore || isValidating || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setPage(p => p + 1);
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
      onPopupScroll={handlePopupScroll}
      loading={isLoading || (isValidating && page > 1)}
      className={className}
    />
  );
};

export default PosSearchSelectMulti;
