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
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      deviceId: val,
      page: DEFAULT_PAGE,
    });
  };

  if (!devicesData?.length && !isLoading) return null;

  const devices = [
    { name: t('warehouse.all'), value: '*' },
    ...(devicesData?.map(item => ({
      name: item.props.name || `Device ${item.props.id}`,
      value: String(item.props.id),
    })) || []),
  ];

  return (
    <div className="flex flex-col text-sm text-text02">
      {t('analysis.deviceId')}
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
