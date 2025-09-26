import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

// services
import {
  DepositDeviceResponse,
  getCurrency,
  getDepositDevice,
} from '@/services/api/pos';

// tables
import { Select, Table } from 'antd';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';

// utils
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';

import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

// types
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

const DepositDevice: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const formattedDate = dayjs().format('YYYY-MM-DD');

  const deviceId = Number(searchParams.get('deviceId') || 0);
  const dateStart = searchParams.get('dateStart') || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate} 23:59`;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const currencyId = Number(searchParams.get('currencyId')) || undefined;

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const filterParams = useMemo(
    () => ({
      dateStart,
      dateEnd,
      page: currentPage,
      size: pageSize,
      deviceId,
      currencyId,
    }),
    [dateStart, dateEnd, currentPage, pageSize, deviceId, currencyId]
  );

  const swrKey = useMemo(() => {
    if (!deviceId) return null;
    return [
      'get-pos-deposits-pos-devices',
      deviceId,
      filterParams.dateStart,
      filterParams.dateEnd,
      filterParams.page,
      filterParams.size,
      filterParams.currencyId,
    ];
  }, [deviceId, filterParams]);

  const { data: filterData, isLoading } = useSWR(
    swrKey,
    () =>
      getDepositDevice(deviceId, {
        dateStart: new Date(filterParams.dateStart),
        dateEnd: new Date(filterParams.dateEnd),
        currencyId: filterParams.currencyId,
        page: filterParams.page,
        size: filterParams.size,
      }).finally(() => {
        setIsInitialLoading(false);
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false
    }
  );

  const { data: currencyData } = useSWR('get-currency', () => getCurrency(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false
  });

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columnsMonitoringDevice: ColumnsType<DepositDeviceResponse["oper"][0]> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Сумма операции',
      dataIndex: 'sumOper',
      key: 'sumOper',
      render: currencyRender,
    },
    {
      title: 'Дата операции',
      dataIndex: 'dateOper',
      key: 'dateOper',
      render: dateRender,
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'dateLoad',
      key: 'dateLoad',
      render: dateRender,
    },
    {
      title: 'Счетчик',
      dataIndex: 'counter',
      key: 'counter',
      sorter: (a, b) => a.counter - b.counter,
    },
    {
      title: 'Локальный ID',
      dataIndex: 'localId',
      key: 'localId',
    },
    {
      title: 'Валюта',
      dataIndex: 'currencyType',
      key: 'currencyType',
    },
  ];

  const deviceMonitoring = useMemo(() => {
    return (
      filterData?.oper?.sort(
        (a, b) =>
          new Date(a.dateOper).getTime() - new Date(b.dateOper).getTime()
      ) || []
    );
  }, [filterData]);

  const totalCount = filterData?.totalCount || 0;

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsMonitoringDevice, 'device-deposits-table-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.depositDevice')}
        </span>
        <QuestionMarkIcon />
      </div>

      <GeneralFilters count={totalCount} display={['device', 'dateTime']}>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('pos.currencyType')}
          </label>
          <Select
            allowClear={false}
            className="w-full sm:w-80"
            options={currencyData?.map(curr => ({
              label: curr.name,
              value: String(curr.id),
            }))}
            value={searchParams.get('currencyId')}
            onChange={value => {
              updateSearchParams(searchParams, setSearchParams, {
                currencyId: value,
              });
            }}
          />
        </div>
      </GeneralFilters>

      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          rowKey="id"
          dataSource={deviceMonitoring}
          columns={visibleColumns}
          loading={isLoading || isInitialLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} операций`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
        />
      </div>
    </>
  );
};

export default DepositDevice;
