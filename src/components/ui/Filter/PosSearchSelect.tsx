import React, { useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';
import { debounce } from 'lodash';
import useSWR from 'swr';
import { getPoses } from '@/services/api/equipment';

const PAGE_SIZE = 10;

type Props = {
  value?: number | string | null;
  onChange: (value: number | string | undefined) => void;
  placementId?: number;
  organizationId?: number;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
  status?: '' | 'error' | 'warning';
  disabled?: boolean;
  extraOptions?: Array<{ label: string; value: string | number }>;
  excludeIds?: number[];
};

const PosSearchSelect: React.FC<Props> = ({
  value,
  onChange,
  placementId,
  organizationId,
  placeholder,
  className,
  allowClear = true,
  status,
  disabled,
  extraOptions = [],
  excludeIds = [],
}) => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cachedSelectedPos, setCachedSelectedPos] = useState<{ id: number; name: string } | null>(
    null
  );

  const debouncedSearchUpdate = useMemo(
    () => debounce((search: string) => setDebouncedSearch(search.trim()), 300),
    []
  );

  useEffect(() => () => debouncedSearchUpdate.cancel(), [debouncedSearchUpdate]);

  const { data: posData, isLoading } = useSWR(
    organizationId ? ['get-pos-search-select', placementId, organizationId, debouncedSearch] : null,
    () =>
      getPoses({
        placementId,
        organizationId: organizationId!,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    { revalidateOnFocus: false, keepPreviousData: true, shouldRetryOnError: false }
  );

  const options = useMemo(() => {
    const items = [
      ...extraOptions.map(option => ({
        label: option.label,
        value: option.value,
      })),
      ...(posData || [])
        .filter(pos => !excludeIds.includes(pos.id))
        .map(pos => ({ label: pos.name, value: pos.id })),
    ];
    if (cachedSelectedPos && !items.some(item => item.value === cachedSelectedPos.id)) {
      items.push({ label: cachedSelectedPos.name, value: cachedSelectedPos.id });
    }
    return items;
  }, [posData, cachedSelectedPos, extraOptions, excludeIds]);

  const handleChange = (val: number | string | null | undefined) => {
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');

    if (val == null || val === '') {
      setCachedSelectedPos(null);
      onChange(undefined);
      return;
    }

    if (extraOptions.some(option => option.value === val)) {
      setCachedSelectedPos(null);
      onChange(val as string);
      return;
    }

    const id = Number(val);
    const label =
      options.find(option => option.value === id)?.label ??
      posData?.find(pos => pos.id === id)?.name;

    if (label) {
      setCachedSelectedPos({ id, name: label });
    }

    onChange(id);
  };

  return (
    <Select
      showSearch
      allowClear={allowClear}
      disabled={disabled}
      placeholder={placeholder}
      value={value === 0 || value === null || value === undefined ? undefined : value}
      onChange={handleChange}
      options={options}
      filterOption={false}
      onSearch={debouncedSearchUpdate}
      onClear={() => {
        debouncedSearchUpdate.cancel();
        setDebouncedSearch('');
        setCachedSelectedPos(null);
      }}
      loading={isLoading}
      status={status}
      className={className}
    />
  );
};

export default PosSearchSelect;
