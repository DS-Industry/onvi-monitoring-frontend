import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { getPlacement } from '@/services/api/device';
import { parseIdsParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

type CityFilterMultiProps = {
  className?: string;
};

const CityFilterMulti: React.FC<CityFilterMultiProps> = ({
  className = 'w-full sm:w-80',
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: cityData } = useSWR('get-city', getPlacement, {
    shouldRetryOnError: false,
  });

  const cityIds = parseIdsParam(searchParams, 'cityIds');

  const cities =
    cityData?.map(item => ({
      label: item.region,
      value: String(item.id),
    })) || [];

  const handleChange = (values: string[]) => {
    const newCityIds = values.map(v => Number(v)).filter(id => !Number.isNaN(id));

    updateSearchParams(searchParams, setSearchParams, {
      cityIds: newCityIds.length ? newCityIds : undefined,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('pos.city')}
      </label>
      <Select
        mode="multiple"
        showSearch
        allowClear
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
