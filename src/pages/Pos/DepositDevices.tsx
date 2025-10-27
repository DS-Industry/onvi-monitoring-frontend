import React, { useMemo, useState } from 'react';

// utils
import useSWR from 'swr';
import { DepositResponse, getDepositPos } from '@/services/api/pos';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getPlacement } from '@/services/api/device';
import {
  formatNumber,
  getCurrencyRender,
  getDateRender,
} from '@/utils/tableUnits';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { updateSearchParams } from '@/utils/searchParamsUtils';

// components
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';

import { Link } from 'react-router-dom';

import { Table } from 'antd';

// types
import type { ColumnsType } from 'antd/es/table';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore';

const DepositDevices: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const user = useUser();
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = searchParams.get('posId') || undefined;
  const dateStart =
    searchParams.get('dateStart') ?? new Date().toISOString().slice(0, 10);

  const dateEnd =
    searchParams.get('dateEnd') ?? new Date().toISOString().slice(0, 10);

  const cityParam = Number(searchParams.get('city')) || undefined;

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch cities for the dropdown filter
  const { data: cities } = useSWR(
    [`get-city`],
    () =>
      getPlacement().then(
        data =>
          data?.map(item => ({ text: item.region, value: item.region })) || []
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const filterParams = useMemo(
    () => ({
      dateStart: new Date(dateStart || `${formattedDate} 00:00`),
      dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
      posId: posId || location.state?.ownerId,
      placementId: cityParam,
      page: currentPage,
      size: pageSize,
      organizationId: user.organizationId
    }),
    [
      dateStart,
      dateEnd,
      posId,
      cityParam,
      currentPage,
      pageSize,
      formattedDate,
      location.state?.ownerId,
      user.organizationId
    ]
  );

  const swrKey = useMemo(
    () =>
      `get-pos-deposits-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}-${filterParams.organizationId}`,
    [filterParams]
  );

  const [totalPosesCount, setTotalPosesCount] = useState(0);

  // Fetch devices data based on the filter parameters
  const { data: devices, isLoading: filterLoading } = useSWR(
    swrKey,
    () =>
      getDepositPos(filterParams)
        .then(data => {
          setTotalPosesCount(data.totalCount || 0);
          const sorted = [...(data.oper ?? [])].sort((a, b) => a.id - b.id);

          return sorted;
        })
        .finally(() => {
          setIsInitialLoading(false);
        }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columns: ColumnsType<DepositResponse> = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('equipment.name'),
      dataIndex: 'name',
      key: 'name',
      filters: [],
      onFilter: (value, record) => record.name === value,
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/station/enrollments/devices',
              search: `?posId=${record.id || '*'}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: t('pos.city'),
      dataIndex: 'city',
      key: 'city',
      filters: cities,
      onFilter: (value, record) => record.city === value,
    },
    {
      title: t('deposit.columns.lastOperation'),
      dataIndex: 'lastOper',
      key: 'lastOper',
      render: dateRender,
      sorter: (a, b) =>
        new Date(a.lastOper).getTime() - new Date(b.lastOper).getTime(),
    },
    {
      title: t('deposit.columns.cash'),
      dataIndex: 'cashSum',
      key: 'cashSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.cashless'),
      dataIndex: 'virtualSum',
      key: 'virtualSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.cashbackCard'),
      dataIndex: 'cashbackSumCard',
      key: 'cashbackSumCard',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.discountSum'),
      dataIndex: 'discountSum',
      key: 'discountSum',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.operationsCount'),
      dataIndex: 'counter',
      key: 'counter',
      sorter: (a, b) => a.counter - b.counter,
      render: (_value, record) => formatNumber(record.counter),
    },
    {
      title: t('deposit.columns.yandexSum'),
      dataIndex: 'yandexSum',
      key: 'yandexSum',
      render: currencyRender,
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'pos-deposits-table-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.deposits')}
        </span>
      </div>

      <GeneralFilters
        count={totalPosesCount}
        display={['pos', 'city', 'dateTime']}
      />

      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          rowKey="id"
          dataSource={devices}
          columns={visibleColumns}
          scroll={{ x: 'max-content' }}
          loading={filterLoading || isInitialLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalPosesCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              });
            },
          }}
        />
      </div>
    </>
  );
};

export default DepositDevices;
