import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { getAllManagerPaperTypes } from '@/services/api/finance';

const PaperTypeFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: paperTypeData, isLoading } = useSWR(
    'get-paper-type',
    () => getAllManagerPaperTypes(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const paperTypes = (paperTypeData?.map(item => ({
    id: item.props.id,
    name: item.props.name,
    type: item.props.type,
  })) || []).sort((a, b) => a.name.localeCompare(b.name));

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      paperTypeId: val === '*' ? undefined : val, 
      page: DEFAULT_PAGE,
    });
  };

  const papers = [
    { label: t('warehouse.all'), value: '*' },
    ...paperTypes.map(item => ({
      label: item.name,
      value: String(item.id),
    })),
  ];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('finance.article')}
      </label>
      <Select
        showSearch
        allowClear={false}
        placeholder={t('finance.article')}
        value={getParam(searchParams, "paperTypeId", "*")} 
        onChange={handleChange}
        loading={isLoading}
        className="w-full"
        options={papers}
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

export default PaperTypeFilter;