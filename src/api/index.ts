import useSWR from 'swr';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: any;
}

//const BASE_URL = process.env.BASE_URL;
export const fetcher = (url: string, options: RequestOptions = {}) => {
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const headers = { ...defaultHeaders, ...options.headers };
  return fetch(url, {
    method: options.method || 'GET',
    headers: headers,
    body: JSON.stringify(options.body),
  }).then(res => res.json());
};

export const useFetchData = (url: string, options: RequestOptions = {}) => {
  const fullUrl = 'http://localhost:5000' + url;
  const { data, error } = useSWR(fullUrl, () => fetcher(fullUrl, options));
  return {
    data,
    error,
    isLoading: !error && !data,
  };
};
