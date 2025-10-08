import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

const { Search } = Input;

const TechTaskNameFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      name: val,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-text02">
        {t('equipment.taskName')}
      </label>
      <Search
        placeholder={t('filters.search.placeholder')}
        className="w-full"
        onSearch={handleSearch}
        defaultValue={searchParams.get('name') || ''}
      />
    </div>
  );
};

export default TechTaskNameFilter;
