import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Table, Select, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import CityFilterMulti from '@/components/ui/Filter/CityFilterMulti';
import PosFilterMulti from '@/components/ui/Filter/PosFilterMulti';
import { updateSearchParams, parseIdsParam } from '@/utils/searchParamsUtils';
import { ALL_PAGE_SIZES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';
import { getDowntime, DowntimeDevice, DowntimePos, DowntimeType, GetDowntimeParams } from '@/services/api/equipment';

const { Text } = Typography;

const downtimeTypeLabels: Record<DowntimeType, string> = {
  [DowntimeType.COIN]: 'downtime.coin',
  [DowntimeType.PAPER]: 'downtime.paper',
  [DowntimeType.POS]: 'downtime.pos',
  [DowntimeType.DEVICE]: 'downtime.device',
};

type FlatDevice = DowntimeDevice & {
  posName: string;
  posId: number;
};

const IdlePaymentDevices: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const dateStart = searchParams.get('dateStart') || dayjs().startOf('day').format('YYYY-MM-DDTHH:mm');
  const dateEnd = searchParams.get('dateEnd') || dayjs().endOf('day').format('YYYY-MM-DDTHH:mm');
  const cityIds = useMemo(() => parseIdsParam(searchParams, 'cityIds'), [searchParams.get('cityIds')]);
  const posIds = useMemo(() => parseIdsParam(searchParams, 'posIds'), [searchParams.get('posIds')]);
  const downtimeTypeParam = searchParams.get('downtimeType') as DowntimeType | null;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (!searchParams.get('downtimeType')) {
      updateSearchParams(searchParams, setSearchParams, {
        downtimeType: DowntimeType.COIN,
        page: String(DEFAULT_PAGE),
      });
    }
  }, []);

  const queryParams: GetDowntimeParams = useMemo(() => {
    const params: GetDowntimeParams = {
      dateStart,
      dateEnd,
      organizationId: user.organizationId,
      page: currentPage,
      size: pageSize,
      downtimeType: downtimeTypeParam || DowntimeType.COIN,
    };
    if (cityIds.length) params.placementIds = cityIds;
    if (posIds.length) params.posIds = posIds;
    return params;
  }, [dateStart, dateEnd, cityIds, posIds, downtimeTypeParam, user.organizationId, currentPage, pageSize]);

  const { data: response, isLoading } = useSWR(
    ['idle-payment-devices', queryParams],
    () => getDowntime(queryParams),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const flatDevices: FlatDevice[] = useMemo(() => {
    if (!response?.pos) return [];
    const result: FlatDevice[] = [];
    response.pos.forEach((pos: DowntimePos) => {
      pos.devices.forEach((device: DowntimeDevice) => {
        result.push({
          ...device,
          posName: pos.posName,
          posId: pos.posId,
        });
      });
    });
    return result;
  }, [response]);

  const handleDowntimeTypeChange = (value: DowntimeType) => {
    updateSearchParams(searchParams, setSearchParams, {
      downtimeType: value,
      page: String(DEFAULT_PAGE),
    });
  };

  const handlePageChange = (page: number, size: number) => {
    updateSearchParams(searchParams, setSearchParams, {
      page: String(page),
      size: String(size),
    });
  };

  const handleExpand = (expanded: boolean, record: FlatDevice) => {
    const key = record.deviceId;
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, key]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
    }
  };

  const columns: ColumnsType<FlatDevice> = [
    {
      title: t('equipment.carWash'),
      dataIndex: 'posName',
      key: 'posName',
    },
    {
      title: t('equipment.device'),
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: t('downtime.idlePeriods'),
      dataIndex: 'idlePeriods',
      key: 'idlePeriods',
      render: (periods: DowntimeDevice['idlePeriods']) => {
        if (!periods || periods.length === 0) return '-';
        return periods.map((p, idx) => (
          <div key={idx}>
            {dayjs(p.idleFrom).format('YYYY-MM-DD HH:mm')} – {dayjs(p.idleTo).format('YYYY-MM-DD HH:mm')}
          </div>
        ));
      },
    },
    {
      title: t('downtime.totalHours'),
      dataIndex: 'idlePeriods',
      key: 'totalHours',
      render: (periods: DowntimeDevice['idlePeriods']) => {
        if (!periods || periods.length === 0) return '-';
        const total = periods.reduce((sum, p) => sum + p.durationHours, 0);
        return total.toFixed(1);
      },
    },
    {
      title: t('downtime.neighborOperCount'),
      dataIndex: 'idlePeriods',
      key: 'neighborOperCount',
      render: (periods: DowntimeDevice['idlePeriods']) => {
        if (!periods || periods.length === 0) return '-';
        const total = periods.reduce((sum, p) => sum + p.neighborOperCount, 0);
        return total;
      },
    },
  ];

  const expandedRowRender = (record: FlatDevice) => {
    if (!record.channels || record.channels.length === 0) {
      return <Text type="secondary">{t('downtime.noChannels')}</Text>;
    }

    const channelColumns = [
      {
        title: t('downtime.channelType'),
        dataIndex: 'type',
        key: 'type',
        render: (type: DowntimeType) => t(downtimeTypeLabels[type]),
      },
      {
        title: t('downtime.idlePeriods'),
        dataIndex: 'idleFrom',
        key: 'idlePeriod',
        render: (_: any, record: any) =>
          `${dayjs(record.idleFrom).format('YYYY-MM-DD HH:mm')} – ${dayjs(record.idleTo).format('YYYY-MM-DD HH:mm')}`,
      },
      {
        title: t('downtime.totalHours'),
        dataIndex: 'durationHours',
        key: 'durationHours',
        render: (val: number) => val.toFixed(1),
      },
      {
        title: t('downtime.neighborOperCount'),
        dataIndex: 'neighborOperCount',
        key: 'neighborOperCount',
      },
    ];

    return (
      <Table
        rowKey={(_, idx) => `${record.deviceId}-channel-${idx}`}
        dataSource={record.channels}
        columns={channelColumns}
        pagination={false}
        size="small"
        bordered
      />
    );
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.idlePaymentDevices')}
          </span>
        </div>
      </div>

      <GeneralFilters
        display={['dateTime', 'reset', 'count']}
        count={response?.totalCount || 0}
      >
        <CityFilterMulti />
        <PosFilterMulti />
        <div className="w-full sm:w-64">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('downtime.downtimeType')}
          </label>
          <Select
            placeholder={t('constants.all')}
            className="w-full"
            value={downtimeTypeParam || DowntimeType.COIN}
            onChange={handleDowntimeTypeChange}
            options={[
              { label: t('downtime.coin'), value: DowntimeType.COIN },
              { label: t('downtime.paper'), value: DowntimeType.PAPER },
              { label: t('downtime.pos'), value: DowntimeType.POS },
              { label: t('downtime.device'), value: DowntimeType.DEVICE },
            ]}
          />
        </div>
      </GeneralFilters>

      <div className="mt-8">
        <Table
          rowKey="deviceId"
          dataSource={flatDevices}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: response?.totalCount || 0,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} ${t('equipment.of')} ${total}`,
            onChange: handlePageChange,
          }}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: handleExpand,
            rowExpandable: (record) => !!(record.channels && record.channels.length > 0),
          }}
          scroll={{ x: 'max-content' }} 
        />
      </div>
    </>
  );
};

export default IdlePaymentDevices;