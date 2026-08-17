/** SWR options for Card detail page: fetch once, no refetch on tab/focus when cached. */
export const cardPageSwr = {
  shouldRetryOnError: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  // Still fetches when there is no cached data; skips refetch when cache exists.
  revalidateIfStale: false,
} as const;
