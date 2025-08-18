import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';
import { Input } from 'antd';

const PhoneFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const phone = getParam(searchParams, 'phone');

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      phone: val,
      page: DEFAULT_PAGE,
    });
  };

  return (
     <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('profile.telephone')}
      </label>
     <Input
        className="w-full sm:w-80"
        placeholder={t('warehouse.enterPhone')}
        value={phone}
        onChange={e => handleChange(e.target.value)}
      />
    </div>
  );
};

export default PhoneFilter;
