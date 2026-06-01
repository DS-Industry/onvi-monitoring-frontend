import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { getCountries } from '@/services/api/countries';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

type CountryFilterMultiProps = {
  className?: string;
};

const CountryFilterMulti: React.FC<CountryFilterMultiProps> = ({
  className = 'w-full sm:w-80',
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: countryData } = useSWR('get-countries', getCountries, {
    shouldRetryOnError: false,
  });

  const countryIdParam = getParam(searchParams, 'countryId');
  const countryId =
    countryIdParam && !Number.isNaN(Number(countryIdParam))
      ? countryIdParam
      : undefined;

  const countries =
    countryData?.map(item => ({
      label: item.name,
      value: String(item.id),
    })) || [];

  const handleChange = (value: string | undefined) => {
    updateSearchParams(searchParams, setSearchParams, {
      countryId: value,
      cityIds: undefined,
      posIds: undefined,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('pos.country')}
      </label>
      <Select
        showSearch
        allowClear
        className={className}
        placeholder={t('filters.country.placeholder')}
        value={countryId}
        onChange={handleChange}
        options={countries}
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

export default CountryFilterMulti;
