import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

const { Search } = Input;

type SearchInputFilterProps = {
  className?: string;
};

const SearchInputFilter: React.FC<SearchInputFilterProps> = ({
  className = 'w-full sm:w-80',
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      search: val,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.search')}
      </label>
      <Search
        placeholder={t('filters.search.placeholder')}
        className={className}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default SearchInputFilter;
