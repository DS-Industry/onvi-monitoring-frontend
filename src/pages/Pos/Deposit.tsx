import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

// services
import { getDeposit } from '@/services/api/pos';
import { getPlacement } from '@/services/api/device';

// utils
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';

// components
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { Table } from 'antd';

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from '@/utils/constants';

// types
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

interface DepositMonitoring {
  id: number;
  name: string;
  city: string;
  counter: number;
  cashSum: number;
  virtualSum: number;
  yandexSum: number;
  mobileSum: number;
  cardSum: number;
  lastOper: Date;
  discountSum: number;
  cashbackSumCard: number;
  cashbackSumMub: number;
}

const Deposit: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultDateStart = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
  const defaultDateEnd = dayjs().format('YYYY-MM-DD');

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = searchParams.get('posId') || undefined;
  const cityParam = Number(searchParams.get('city')) || '*';
  const dateStart = searchParams.get('dateStart') || defaultDateStart;
  const dateEnd = searchParams.get('dateEnd') || defaultDateEnd;

  const filterParams = useMemo(
    () => ({
      dateStart: dayjs(dateStart).toDate(),
      dateEnd: dayjs(dateEnd).toDate(),
      posId,
      placementId: cityParam,
      page: currentPage,
      size: pageSize,
    }),
    [dateStart, dateEnd, posId, cityParam, currentPage, pageSize]
  );

  const swrKey = `get-pos-deposits-${filterParams.posId}-${
    filterParams.placementId
  }-${dayjs(filterParams.dateStart).toISOString()}-${dayjs(
    filterParams.dateEnd
  ).toISOString()}-${filterParams.page}-${filterParams.size}`;

  const [totalCount, setTotalCount] = useState(0);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data: devices, isLoading: filterLoading } = useSWR(
    posId ? swrKey : null,
    () =>
      getDeposit(posId!, {
        dateStart: filterParams.dateStart,
        dateEnd: filterParams.dateEnd,
      })
        .then(data => {
          const sorted = [...(data ?? [])].sort((a, b) => a.id - b.id);
          setTotalCount(sorted.length);

          return sorted;
        })
        .finally(() => {
          setIsInitialLoading(false);
        }),
    {
      revalidateOnReconnect: true,
      keepPreviousData: true,
      revalidateOnFocus: true,
      shouldRetryOnError: false
    }
  );

  const { data: cities } = useSWR(
    'get-cities',
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

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columns: ColumnsType<DepositMonitoring> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link
          to={{
            pathname: '/station/enrollments/device',
            search: `?posId=${posId}&deviceId=${record.id}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
          }}
          className="text-blue-500 hover:text-blue-700 font-semibold"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Город',
      dataIndex: 'city',
      key: 'city',
      filters: cities,
      onFilter: (value, record) => record.city === value,
    },
    {
      title: 'Последняя операция',
      dataIndex: 'lastOper',
      key: 'lastOper',
      render: dateRender,
      sorter: (a, b) =>
        dayjs(a.lastOper).valueOf() - dayjs(b.lastOper).valueOf(),
    },
    {
      title: 'Наличные',
      dataIndex: 'cashSum',
      key: 'cashSum',
      render: currencyRender,
    },
    {
      title: 'Безналичные',
      dataIndex: 'virtualSum',
      key: 'virtualSum',
      render: currencyRender,
    },
    {
      title: 'Cashback по картам',
      dataIndex: 'cashbackSumCard',
      key: 'cashbackSumCard',
      render: currencyRender,
    },
    {
      title: 'Сумма скидки',
      dataIndex: 'discountSum',
      key: 'discountSum',
      render: currencyRender,
    },
    {
      title: 'Кол-во операций',
      dataIndex: 'counter',
      key: 'counter',
      sorter: (a, b) => a.counter - b.counter,
    },
    {
      title: 'Яндекс Сумма',
      dataIndex: 'yandexSum',
      key: 'yandexSum',
      render: currencyRender,
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'devices-deposit-table-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.depositDevices')}
        </span>
        <QuestionMarkIcon />
      </div>

      <GeneralFilters count={totalCount} display={['pos', 'dateTime']} />

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

export default Deposit;
