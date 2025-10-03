import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE, groups } from '@/utils/constants';

const GroupFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      group: val,
      page: DEFAULT_PAGE,
    });
  };

  const groupsData = [
    { label: t('warehouse.all'), value: '*' },
    ...groups.map(item => ({
      label: item.name,
      value: item.value,
    })),
  ];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('finance.group')}
      </label>
      <Select
        showSearch
        allowClear={false}
        placeholder={t('finance.group')}
        value={getParam(searchParams, 'group', '*')}
        onChange={handleChange}
        className="w-full"
        options={groupsData}
        optionFilterProp="label"
      />
    </div>
  );
};

export default GroupFilter;
