import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from 'antd';
import useSWR from 'swr';
import { getPoses, PosResponse } from '@/services/api/equipment';
import { useDebouncedSearch } from './useDebouncedSearch';

const PAGE_SIZE = 10;

type Props = {
  value?: number;
  onChange: (value: number | undefined) => void;
  placementId?: number;
  organizationId?: number;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
  disabled?: boolean;
};

const PosSearchSelect: React.FC<Props> = ({
  value,
  onChange,
  placementId,
  organizationId,
  placeholder,
  className,
  allowClear = true,
  disabled,
}) => {
  const { debouncedSearch, debouncedSearchUpdate, resetSearch } = useDebouncedSearch();
  const [pinned, setPinned] = useState<{ id: number; name: string }>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PosResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    resetSearch();
    setPinned(undefined);
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [placementId, organizationId, resetSearch]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [debouncedSearch]);

  const { data: posData, isLoading, isValidating } = useSWR(
    organizationId
      ? ['get-pos-search', placementId, organizationId, debouncedSearch, page]
      : null,
    () =>
      getPoses({
        placementId,
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

  const needsPinnedFetch =
    Boolean(organizationId && value) &&
    !items.some(p => p.id === value) &&
    (!pinned || pinned.id !== value) &&
    posData !== undefined;

  const { data: pinnedData } = useSWR(
    needsPinnedFetch
      ? ['get-pos-pinned', placementId, organizationId, value]
      : null,
    () =>
      getPoses({
        placementId,
        organizationId: organizationId!,
        posIds: [value!],
      }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (!value) {
      setPinned(undefined);
      return;
    }
    const match = items.find(p => p.id === value) ?? pinnedData?.[0];
    if (match) {
      setPinned({ id: match.id, name: match.name });
      return;
    }
    if (pinnedData?.length === 0) onChangeRef.current(undefined);
  }, [value, items, pinnedData]);

  const options = useMemo(() => {
    const mapped = items.map(p => ({ label: p.name, value: p.id }));
    if (pinned && !mapped.some(o => o.value === pinned.id)) {
      mapped.push({ label: pinned.name, value: pinned.id });
    }
    return mapped;
  }, [items, pinned]);

  const handleChange = (val: number | null) => {
    resetSearch();
    if (val == null) {
      setPinned(undefined);
      onChange(undefined);
      return;
    }
    const label = options.find(o => o.value === val)?.label;
    if (label) setPinned({ id: val, name: label });
    onChange(val);
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
      showSearch
      allowClear={allowClear}
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

export default PosSearchSelect;
