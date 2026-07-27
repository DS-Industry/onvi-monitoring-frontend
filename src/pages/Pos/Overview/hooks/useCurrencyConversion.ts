import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { getCountries } from '@/services/api/countries';
import { updateSearchParams } from '@/utils/searchParamsUtils';

export type CurrencyConversion = {
  isConversionActive: boolean;
  conversionRate: number | undefined;
  sourceCurrencyCode: string | undefined;
  displayCurrencyCode: string | undefined;
  displayCurrencySymbol: string;
  targetCurrencyOptions: { label: string; value: string }[];
  targetCurrencyId: number | undefined;
  convert: (value: number | null | undefined) => number | null | undefined;
};

export function useCurrencyConversion(): CurrencyConversion {
  const [searchParams, setSearchParams] = useSearchParams();

  const countryIdRaw = searchParams.get('countryId');
  const countryId =
    countryIdRaw && !Number.isNaN(Number(countryIdRaw))
      ? Number(countryIdRaw)
      : undefined;

  const targetCurrencyIdRaw = searchParams.get('targetCurrencyId');
  const targetCurrencyId =
    targetCurrencyIdRaw && !Number.isNaN(Number(targetCurrencyIdRaw))
      ? Number(targetCurrencyIdRaw)
      : undefined;

  const conversionRateRaw = searchParams.get('currencyRate');
  const conversionRate = useMemo(() => {
    if (!conversionRateRaw) return undefined;
    const value = Number(conversionRateRaw);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }, [conversionRateRaw]);

  const { data: countries } = useSWR(['get-countries'], () => getCountries(), {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const selectedCountry = useMemo(
    () => countries?.find(item => item.id === countryId),
    [countries, countryId]
  );

  const sourceCurrencyCode =
    selectedCountry?.currency != null
      ? String(selectedCountry.currency)
      : undefined;
  const sourceCurrencyId = selectedCountry?.currencyId;
  const sourceSymbol = selectedCountry?.symbol;

  const availableCountryCurrencies = useMemo(() => {
    const uniqueMap = new Map<
      number,
      { currencyId: number; currency: string; symbol?: string }
    >();

    (countries ?? []).forEach(item => {
      if (!uniqueMap.has(item.currencyId)) {
        uniqueMap.set(item.currencyId, {
          currencyId: item.currencyId,
          currency: item.currency,
          symbol: item.symbol,
        });
      }
    });

    return Array.from(uniqueMap.values());
  }, [countries]);

  const targetCurrency = useMemo(
    () =>
      availableCountryCurrencies.find(
        item => item.currencyId === targetCurrencyId
      ),
    [availableCountryCurrencies, targetCurrencyId]
  );

  const targetCurrencyOptions = useMemo(
    () =>
      availableCountryCurrencies
        .filter(item => item.currencyId !== sourceCurrencyId)
        .map(item => ({
          label: item.symbol
            ? `${item.currency} (${item.symbol})`
            : item.currency,
          value: String(item.currencyId),
        })),
    [availableCountryCurrencies, sourceCurrencyId]
  );

  const isConversionActive = Boolean(
    targetCurrency && conversionRate && conversionRate > 0
  );

  const displayCurrencyCode = useMemo(() => {
    const code = isConversionActive ? targetCurrency?.currency : sourceCurrencyCode;
    if (code == null) return undefined;
    return String(code);
  }, [isConversionActive, targetCurrency?.currency, sourceCurrencyCode]);

  const displayCurrencySymbol = useMemo(() => {
    if (isConversionActive) {
      return targetCurrency?.symbol || String(targetCurrency?.currency ?? '₽');
    }
    return sourceSymbol || sourceCurrencyCode || '₽';
  }, [
    isConversionActive,
    targetCurrency?.symbol,
    targetCurrency?.currency,
    sourceSymbol,
    sourceCurrencyCode,
  ]);

  // Drop target if it matches the new source currency
  useEffect(() => {
    if (
      sourceCurrencyId != null &&
      targetCurrencyId != null &&
      targetCurrencyId === sourceCurrencyId
    ) {
      updateSearchParams(searchParams, setSearchParams, {
        targetCurrencyId: undefined,
        currencyRate: undefined,
      });
    }
  }, [sourceCurrencyId, targetCurrencyId, searchParams, setSearchParams]);

  const convert = useCallback(
    (value: number | null | undefined) => {
      if (value === null || value === undefined || Number.isNaN(value)) {
        return value;
      }
      if (!isConversionActive || !conversionRate) return value;
      return value * conversionRate;
    },
    [isConversionActive, conversionRate]
  );

  return {
    isConversionActive,
    conversionRate,
    sourceCurrencyCode,
    displayCurrencyCode,
    displayCurrencySymbol,
    targetCurrencyOptions,
    targetCurrencyId,
    convert,
  };
}
