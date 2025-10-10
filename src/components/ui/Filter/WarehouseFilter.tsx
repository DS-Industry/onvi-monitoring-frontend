import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getWarehouses } from '@/services/api/warehouse/index.ts';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';
import { useUser } from '@/hooks/useUserStore';

const WarehouseFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const placementId = Number(searchParams.get('city')) || undefined;
  const posId = Number(searchParams.get('posId')) || undefined;

  const { data: warehouseData, isLoading } = useSWR(
    user.organizationId
      ? [`get-warehouse`, placementId, posId, user.organizationId]
      : null,
    () =>
      getWarehouses({
        placementId,
        posId,
        organizationId: user.organizationId,
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
      warehouseId: val,
      page: DEFAULT_PAGE,
    });
  };

  const warehouses =
    warehouseData?.map(item => ({
      name: item.props.name,
      value: String(item.props.id),
    })) || [];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.warehouseId')}
      </label>
      <Select
        className="w-full sm:w-80"
        allowClear={true}
        placeholder={t('filters.warehouse.placeholder')}
        value={getParam(searchParams, 'warehouseId')}
        onChange={handleChange}
        loading={isLoading}
        options={warehouses.map(item => ({
          label: item.name,
          value: item.value,
        }))}
        showSearch={true}
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

export default WarehouseFilter;
