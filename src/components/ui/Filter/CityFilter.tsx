import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { getPlacement } from '@/services/api/device';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

type CityFilterProps = {
  className?: string;
};

const CityFilter: React.FC<CityFilterProps> = ({
  className = 'w-full sm:w-80',
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: cityData } = useSWR('get-city', getPlacement);

  const getParam = (key: string, fallback = '') =>
    searchParams.get(key) || fallback;

  const cities = [
    { label: t("warehouse.all"), value: "" },
    ...(cityData?.map((item) => ({
      label: item.region,
      value: String(item.id),
    })) || []),
  ];

  const handleChange = (value: string | undefined) => {
    updateSearchParams(searchParams, setSearchParams, {
      city: value,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('pos.city')}
      </label>
    <Select
      showSearch
      allowClear={false}
      className={className}
      value={getParam("city", "")}
      onChange={handleChange}
      options={cities}
      optionFilterProp="label"
      filterOption={(input, option) =>
        (option?.label ?? "")
          .toString()
          .toLowerCase()
          .includes(input.toLowerCase())
      }
    />
    </div>
  );
};

export default CityFilter;
