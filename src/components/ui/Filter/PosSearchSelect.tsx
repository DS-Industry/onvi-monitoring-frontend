import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from 'antd';
import useSWR from 'swr';
import { getPoses } from '@/services/api/equipment';
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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    resetSearch();
    setPinned(undefined);
  }, [placementId, organizationId, resetSearch]);

  const { data: posData, isLoading } = useSWR(
    organizationId
      ? ['get-pos-search', placementId, organizationId, debouncedSearch]
      : null,
    () =>
      getPoses({
        placementId,
        organizationId: organizationId!,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    { revalidateOnFocus: false, keepPreviousData: true, shouldRetryOnError: false }
  );

  const needsPinnedFetch =
    Boolean(organizationId && value) &&
    posData !== undefined &&
    !posData.some(p => p.id === value);

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
    const match = posData?.find(p => p.id === value) ?? pinnedData?.[0];
    if (match) {
      setPinned({ id: match.id, name: match.name });
      return;
    }
    if (pinnedData?.length === 0) onChangeRef.current(undefined);
  }, [value, posData, pinnedData]);

  const options = useMemo(() => {
    const items = (posData || []).map(p => ({ label: p.name, value: p.id }));
    if (pinned && !items.some(o => o.value === pinned.id)) {
      items.push({ label: pinned.name, value: pinned.id });
    }
    return items;
  }, [posData, pinned]);

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
      loading={isLoading}
      className={className}
    />
  );
};

export default PosSearchSelect;
