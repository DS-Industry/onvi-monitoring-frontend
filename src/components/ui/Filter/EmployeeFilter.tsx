import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getWorkers } from '@/services/api/equipment';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';

const EmployeeFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const { data: workerData, isLoading } = useSWR(
    [`get-worker`],
    () => getWorkers(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      userId: val,
      page: DEFAULT_PAGE,
    });
  };

  if (!workerData?.length && !isLoading) return null;

  const workers = (workerData ?? []).map(item => ({
    label: `${item.name} ${item.surname}`,
    value: String(item.id)
  }));

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('equipment.user')}
      </label>
      <Select
        showSearch
        allowClear={false}
        placeholder={t('filters.employee.placeholder')}
        value={getParam(searchParams, "userId", String(user.id))}
        onChange={handleChange}
        loading={isLoading}
        className="w-full"
        options={workers}
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

export default EmployeeFilter;