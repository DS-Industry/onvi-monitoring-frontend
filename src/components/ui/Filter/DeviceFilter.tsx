import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getDevices } from '@/services/api/equipment/index.ts';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

const DeviceFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback = '') =>
    searchParams.get(key) || fallback;

  const posId = Number(getParam("posId", undefined));

  const { data: devicesData, isLoading } = useSWR(
    posId ? [`get-devices`, posId] : null,
    () => getDevices(posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      deviceId: val,
      page: DEFAULT_PAGE,
    });
  };

  const devices = [
    { name: t('warehouse.all'), value: '*' },
    ...(devicesData?.map(item => ({
      name: item.props.name || `Device ${item.props.id}`,
      value: String(item.props.id),
    })) || []),
  ];

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.deviceId')}
      </label>
      <Select
        className="w-full sm:w-80"
        placeholder={t('filters.device.placeholder')}
        value={getParam('deviceId', '')}
        onChange={handleChange}
        loading={isLoading}
        options={devices.map(item => ({
          label: item.name,
          value: item.value,
        }))}
      />
    </div>
  );
};

export default DeviceFilter;
