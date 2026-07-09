import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';

export const useDebouncedSearch = (delay = 300) => {
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debouncedSearchUpdate = useMemo(
    () => debounce((search: string) => setDebouncedSearch(search.trim()), delay),
    [delay]
  );

  useEffect(() => () => debouncedSearchUpdate.cancel(), [debouncedSearchUpdate]);

  const resetSearch = useCallback(() => {
    debouncedSearchUpdate.cancel();
    setDebouncedSearch('');
  }, [debouncedSearchUpdate]);

  return { debouncedSearch, debouncedSearchUpdate, resetSearch };
};
