export const updateSearchParams = (
  searchParams: URLSearchParams,
  setSearchParams: (params: URLSearchParams) => void,
  updates: Record<string, any>
) => {
  const newParams = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === '' || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
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
