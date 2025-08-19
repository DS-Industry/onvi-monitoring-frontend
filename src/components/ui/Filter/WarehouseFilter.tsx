import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  WAREHOUSE_RESPONSE,
  getWarehouses,
} from '@/services/api/warehouse/index.ts';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

interface WarehouseFilterProps {
  onSelect?: (val: WAREHOUSE_RESPONSE) => void;
}

const WarehouseFilter: React.FC<WarehouseFilterProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback = '') =>
    searchParams.get(key) || fallback;

  const placementId = Number(searchParams.get('city')) || undefined;
  const posId = Number(searchParams.get('posId')) || undefined;

  const { data: warehouseData, isLoading } = useSWR(
    [`get-warehouse`, placementId, posId],
    () => getWarehouses({ placementId, posId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const handleChange = (val: string) => {
    if (onSelect) {
      const warehouse = warehouseData?.find(wd => wd.props.id === Number(val));

      if (warehouse) {
        onSelect(warehouse);
      }
    } else {
      updateSearchParams(searchParams, setSearchParams, {
        warehouseId: val,
        page: DEFAULT_PAGE,
      });
    }
  };

  if (!warehouseData?.length && !isLoading) return null;

  const warehouses = [
    { name: t('warehouse.all'), value: '*' },
    ...(warehouseData?.map(item => ({
      name: item.props.name,
      value: String(item.props.id),
    })) || []),
  ];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.warehouseId')}
      </label>
      <Select
        className="w-full sm:w-80"
        placeholder={t('filters.warehouse.placeholder')}
        value={getParam('warehouseId', '*')}
        onChange={handleChange}
        loading={isLoading}
        options={warehouses.map(item => ({
          label: item.name,
          value: item.value,
        }))}
      />
    </div>
  );
};

export default WarehouseFilter;
