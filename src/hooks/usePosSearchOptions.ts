import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { debounce } from 'lodash';
import { getPoses } from '@/services/api/equipment';

const POS_PAGE_SIZE = 10;

type PosSearchOptionsParams = {
  placementId?: number;
  placementIds?: number[];
  organizationId?: number;
  enabled?: boolean;
  /** When this value changes, search text and label cache are reset. */
  contextKey?: string;
  /** IDs from URL — validated once and used to seed the label cache. */
  selectedIds?: number[];
  onSelectedIdsPruned?: (validIds: number[]) => void;
  onContextKeyChange?: () => void;
};

export function usePosSearchOptions({
  placementId,
  placementIds,
  organizationId,
  enabled = true,
  contextKey,
  selectedIds = [],
  onSelectedIdsPruned,
  onContextKeyChange,
}: PosSearchOptionsParams) {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cachedPoses, setCachedPoses] = useState<Map<number, string>>(new Map());
  const prevContextKeyRef = useRef(contextKey);

  const debouncedSearchUpdate = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value.trim()), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearchUpdate.cancel();
    };
  }, [debouncedSearchUpdate]);

  const resetSearch = useCallback(() => {
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');
  }, [debouncedSearchUpdate]);

  const clearCache = useCallback(() => {
    setCachedPoses(new Map());
  }, []);

  useEffect(() => {
    if (contextKey === undefined) return;
    if (prevContextKeyRef.current === contextKey) return;
    prevContextKeyRef.current = contextKey;
    resetSearch();
    clearCache();
    onContextKeyChange?.();
  }, [contextKey, resetSearch, clearCache, onContextKeyChange]);

  const { data: posData, isLoading } = useSWR(
    enabled && organizationId
      ? [
          'get-pos-search',
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
        organizationId,
        size: POS_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const idsToValidate = useMemo(
    () => selectedIds.filter(id => !cachedPoses.has(id)),
    [selectedIds, cachedPoses]
  );

  const { data: validatedPosData } = useSWR(
    enabled && organizationId && idsToValidate.length
      ? [
          'get-pos-validate',
          placementId,
          placementIds?.join(','),
          organizationId,
          idsToValidate.join(','),
        ]
      : null,
    () =>
      getPoses({
        placementId,
        placementIds,
        organizationId,
        posIds: idsToValidate,
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (!idsToValidate.length || validatedPosData === undefined) return;

    setCachedPoses(prev => {
      const next = new Map(prev);
      validatedPosData.forEach(p => next.set(p.id, p.name));
      return next;
    });

    if (!selectedIds.length || !onSelectedIdsPruned) return;

    const validIdSet = new Set(validatedPosData.map(p => p.id));
    const pruned = selectedIds.filter(
      id => !idsToValidate.includes(id) || validIdSet.has(id)
    );

    if (pruned.length !== selectedIds.length) {
      onSelectedIdsPruned(pruned);
    }
  }, [validatedPosData, idsToValidate, selectedIds, onSelectedIdsPruned]);

  const options = useMemo(() => {
    const items = (posData || []).map(p => ({
      label: p.name,
      value: String(p.id),
    }));
    cachedPoses.forEach((name, id) => {
      if (!items.some(o => o.value === String(id))) {
        items.push({ label: name, value: String(id) });
      }
    });
    return items;
  }, [posData, cachedPoses]);

  const updateCachedSelections = useCallback(
    (ids: number[]) => {
      setCachedPoses(prev => {
        const next = new Map<number, string>();
        ids.forEach(id => {
          const label =
            posData?.find(p => p.id === id)?.name ?? prev.get(id);
          if (label) {
            next.set(id, label);
          }
        });
        return next;
      });
    },
    [posData]
  );

  return {
    options,
    isLoading,
    debouncedSearchUpdate,
    resetSearch,
    updateCachedSelections,
  };
}
