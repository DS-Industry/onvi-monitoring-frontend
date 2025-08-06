import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select, Spin } from 'antd';
import { getPoses } from '@/services/api/equipment';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

const PosFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback = '') =>
    searchParams.get(key) || fallback;

  const city = getParam('city', '*');
  const placementId = city === '*' ? '' : city;

  const { data: posData, isLoading } = useSWR(
    placementId ? [`get-pos`, placementId] : null,
    () => getPoses({ placementId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      posId: val,
      page: DEFAULT_PAGE,
    });
  };

  if (!posData?.length && !isLoading) return null;

  const poses = [
    { label: t('warehouse.all'), value: '*' },
    ...(posData?.map(item => ({
      label: item.name,
      value: String(item.id),
    })) || []),
  ];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.posId')}
      </label>
      <Select
        showSearch
        allowClear={false}
        placeholder={t('filters.pos.placeholder')}
        value={getParam('posId', '*')}
        onChange={handleChange}
        loading={isLoading}
        className="w-full"
        options={poses}
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        notFoundContent={isLoading ? <Spin size="small" /> : null}
      />
    </div>
  );
};

export default PosFilter;
