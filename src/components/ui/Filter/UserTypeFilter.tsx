import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

const UserTypeFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      userType: val,
      page: DEFAULT_PAGE,
    });
  };

  const userTypeOptions = [
    { label: t('warehouse.all'), value: '*' },
    { label: t('marketing.physical'), value: 'PHYSICAL' },
    { label: t('marketing.legal'), value: 'LEGAL' },
  ];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('marketing.type')}
      </label>
      <Select
        showSearch
        allowClear={false}
        placeholder={t('marketing.phys')}
        value={getParam(searchParams, 'userType', '*')}
        onChange={handleChange}
        className="w-full"
        options={userTypeOptions}
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        notFoundContent={t('table.noData')}
      />
    </div>
  );
};

export default UserTypeFilter;
