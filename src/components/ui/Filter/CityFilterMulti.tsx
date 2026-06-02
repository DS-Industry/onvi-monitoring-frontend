import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { getPlacement } from '@/services/api/device';
import { getParam, parseIdsParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

type CityFilterMultiProps = {
  className?: string;
  countryParamKey?: string;
};

const CityFilterMulti: React.FC<CityFilterMultiProps> = ({
  className = 'w-full sm:w-80',
  countryParamKey,
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const countryIdParam = countryParamKey
    ? getParam(searchParams, countryParamKey)
    : undefined;
  const countryId =
    countryIdParam && !Number.isNaN(Number(countryIdParam))
      ? Number(countryIdParam)
      : undefined;

  const requiresCountry = Boolean(countryParamKey);

  const { data: cityData } = useSWR(
    requiresCountry
      ? countryId
        ? ['get-city', countryId]
        : null
      : 'get-city',
    () => getPlacement(countryId != null ? { countryId } : undefined),
    {
      shouldRetryOnError: false,
    }
  );

  const cityIds = parseIdsParam(searchParams, 'cityIds');

  const cities = useMemo(
    () =>
      cityData?.map(item => ({
        label: item.region,
        value: String(item.id),
      })) || [],
    [cityData]
  );

  const validCityIdSet = useMemo(
    () => new Set(cities.map(opt => Number(opt.value))),
    [cities]
  );

  useEffect(() => {
    if (!requiresCountry) return;

    if (!countryId) {
      const currentCityIds = parseIdsParam(searchParams, 'cityIds');
      const currentPosIds = parseIdsParam(searchParams, 'posIds');
      if (currentCityIds.length === 0 && currentPosIds.length === 0) return;

      updateSearchParams(searchParams, setSearchParams, {
        cityIds: undefined,
        posIds: undefined,
      });
      return;
    }

    if (!cityData) return;

    const currentCityIds = parseIdsParam(searchParams, 'cityIds');
    const pruned = currentCityIds.filter(id => validCityIdSet.has(id));
    if (pruned.length === currentCityIds.length) return;

    updateSearchParams(searchParams, setSearchParams, {
      cityIds: pruned.length ? pruned : undefined,
      posIds: pruned.length ? undefined : undefined,
    });
  }, [
    requiresCountry,
    countryId,
    cityData,
    validCityIdSet,
    searchParams,
    setSearchParams,
  ]);

  const handleChange = (values: string[]) => {
    const newCityIds = values.map(v => Number(v)).filter(id => !Number.isNaN(id));

    updateSearchParams(searchParams, setSearchParams, {
      cityIds: newCityIds.length ? newCityIds : undefined,
      page: DEFAULT_PAGE,
    });
  };

  const disabled = requiresCountry && countryId == null;

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('pos.city')}
      </label>
      <Select
        mode="multiple"
        showSearch
        allowClear
        disabled={disabled}
        className={className}
        placeholder={t('filters.city.placeholder')}
        value={cityIds.map(String)}
        onChange={handleChange}
        options={cities}
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </div>
  );
};

export default CityFilterMulti;
