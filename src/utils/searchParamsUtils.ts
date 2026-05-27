const serializeParamValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const ids = [...new Set(value.map(Number).filter(id => !Number.isNaN(id)))].sort(
      (a, b) => a - b
    );
    return ids.length ? ids.join(',') : undefined;
  }
  return String(value);
};

export const formatIdsParam = (ids: number[]): string | undefined => {
  const unique = [...new Set(ids.filter(id => !Number.isNaN(id)))].sort(
    (a, b) => a - b
  );
  return unique.length ? unique.join(',') : undefined;
};

export const parseIdsParam = (
  searchParams: URLSearchParams,
  key: string
): number[] => {
  const raw = searchParams.get(key);
  if (!raw) return [];

  return [
    ...new Set(
      raw
        .split(',')
        .map(id => Number(id.trim()))
        .filter(id => !Number.isNaN(id))
    ),
  ];
};

export const updateSearchParams = (
  searchParams: URLSearchParams,
  setSearchParams: (params: URLSearchParams) => void,
  updates: Record<string, unknown>
) => {
  const newParams = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) {
      newParams.delete(key);
      return;
    }

    if (Array.isArray(value) && value.length === 0) {
      newParams.delete(key);
      return;
    }

    const serialized = serializeParamValue(value);
    if (serialized === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, serialized);
    }
  });
  setSearchParams(newParams);
};

export const getParam = (
  searchParams: URLSearchParams,
  key: string,
  fallback: string | undefined = undefined
): string | undefined => {
  return searchParams.get(key) || fallback;
};
