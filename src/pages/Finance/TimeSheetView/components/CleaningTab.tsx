import React from 'react';

import { Link, useSearchParams } from 'react-router-dom';

// utils
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getCashOperCleanById } from '@/services/api/finance';
import { getDevices } from '@/services/api/equipment';
import { formatNumber } from '@/utils/tableUnits';

// components
import { Table } from 'antd';

// types
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { TurningType } from '@/services/api/pos';

interface TableRowData {
  key: string;
  deviceName: string | null;
  deviceId: number;
  programName: string;
  countProgram: number;
  time: string;
}

interface CleaningTabProps {
  shiftStartDate?: Date;
  shiftEndDate?: Date;
}

const CleaningTab: React.FC<CleaningTabProps> = ({ shiftStartDate, shiftEndDate }) => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get('id')
    ? Number(searchParams.get('id'))
    : undefined;
  const posId = searchParams.get('posId')
    ? Number(searchParams.get('posId'))
    : undefined;

  const { data: deviceData } = useSWR(
    posId ? [`get-device-${posId}`] : null,
    () => getDevices(posId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const devices =
    deviceData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const { data: cashOperCleanData, isLoading: loadingCashOperClean } = useSWR(
    shiftId ? [`get-cash-oper-clean-data-${shiftId}`] : null,
    () => getCashOperCleanById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const tableData: TableRowData[] =
    cashOperCleanData?.flatMap(({ deviceId, programData }) => {
      const deviceName = devices.find(dev => dev.value === deviceId)?.name || '';

      return programData.map(({ programName, countProgram, time }, index) => ({
        key: `${deviceId}-${programName}-${index}`,
        deviceName: index === 0 ? deviceName : null,
        deviceId,
        programName,
        countProgram,
        time,
      }));
    }) || [];

  const columns: ColumnsType<TableRowData> = [
    {
      title: t('finance.deviceName'),
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (text, record) => {
        if (!text) return null;
        const dateStartValue = shiftStartDate
          ? dayjs(shiftStartDate).format('YYYY-MM-DDTHH:mm')
          : '';
        const dateEndValue = shiftEndDate
          ? dayjs(shiftEndDate).format('YYYY-MM-DDTHH:mm')
          : '';
        const url = `/station/programs/device?posId=${posId}&deviceId=${record.deviceId}&dateStart=${encodeURIComponent(dateStartValue)}&dateEnd=${encodeURIComponent(dateEndValue)}&turningType=${TurningType.CLEANING}&page=1`;
        return (
          <Link
            to={url}
            className="text-primary02 hover:text-primary02_Hover font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: t('finance.program'),
      dataIndex: 'programName',
      key: 'programName',
    },
    {
      title: t('finance.programCount'),
      dataIndex: 'countProgram',
      key: 'countProgram',
      render: (value: number) => formatNumber(value),
    },
    {
      title: t('finance.totalTime'),
      dataIndex: 'time',
      key: 'time',
    },
  ];

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="key"
      pagination={false}
      size="small"
      loading={loadingCashOperClean}
      scroll={{ x: '500px' }}
      locale={{ emptyText: t('table.noData') }}
    />
  );
};

export default CleaningTab;
