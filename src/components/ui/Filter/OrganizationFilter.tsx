import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getOrganization } from '@/services/api/organization/index.ts';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

const OrganizationFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const city = getParam(searchParams, 'city', undefined);
  const placementId = city ? Number(city) : undefined;

  const { data: organizationData, isLoading } = useSWR(
    placementId ? [`get-organization`, placementId] : null,
    () => getOrganization({ placementId: placementId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      orgId: val,
      page: DEFAULT_PAGE,
    });
  };

  if (!organizationData?.length && !isLoading) return null;

  const organizations = [
    { name: t('warehouse.all'), value: '*' },
    ...(organizationData?.map(item => ({
      name: item.name,
      value: String(item.id),
    })) || []),
  ];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.organizationId')}
      </label>
      <Select
        className="w-full sm:w-80"
        placeholder={t('filters.organization.placeholder')}
        value={getParam(searchParams, 'orgId', '')}
        onChange={handleChange}
        loading={isLoading}
        options={organizations.map(item => ({
          label: item.name,
          value: item.value,
        }))}
        showSearch={true}
        notFoundContent={t('table.noData')}
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

export default OrganizationFilter;
