import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { getPoses } from '@/services/api/equipment';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore.ts';
import { getNumericPrefix } from '@/utils/getNumericPrefix';

const PosFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const placementId = Number(searchParams.get('city')) || undefined;
  const user = useUser();

  const { data: posData, isLoading } = useSWR(
    [`get-pos`, placementId, user.organizationId],
    () =>
      getPoses({
        placementId: placementId,
        organizationId: user.organizationId!,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      posId: val,
      page: DEFAULT_PAGE,
    });
  };

  const sortedPoses = posData
    ?.slice()
    .sort((a, b) => {
      const numA = getNumericPrefix(a.name);
      const numB = getNumericPrefix(b.name);
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name);
    })
    .map(item => ({
      label: item.name,
      value: String(item.id),
    })) || [];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.posId')}
      </label>
      <Select
        showSearch
        allowClear={true}
        placeholder={t('filters.pos.placeholder')}
        value={getParam(searchParams, 'posId')}
        onChange={handleChange}
        loading={isLoading}
        className="w-full"
        options={sortedPoses}
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

export default PosFilter;
