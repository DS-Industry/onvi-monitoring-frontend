import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

const ExcessFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const excessParam = searchParams.get('excess') || 'ALL';

  const handleChange = (value: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      excess: value === 'ALL' ? undefined : value,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('filters.excess')}
      </label>
      <Select
        allowClear={false}
        className="w-full"
        value={excessParam}
        onChange={handleChange}
        options={[
          { label: t('constants.all'), value: 'ALL' },
          { label: t('filters.excess'), value: 'EXCESS' },
        ]}
      />
    </div>
  );
};

export default ExcessFilter;