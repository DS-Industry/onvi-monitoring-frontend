import React, { useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

// services
import { DepositResponse, getDeposit } from '@/services/api/pos';
import { getPlacement } from '@/services/api/device';

// utils
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getCurrencyRender, getDateRender, formatNumber } from '@/utils/tableUnits';
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
import { ArrowLeftOutlined } from '@ant-design/icons';

// Deposit component
const Deposit: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const swrKey = `get-pos-deposits-${filterParams.posId}-${filterParams.placementId
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
      shouldRetryOnError: false,
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
      shouldRetryOnError: false,
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
      title: t('table.columns.name'),
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
      title: t('table.columns.city'),
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
        dayjs(a.lastOper).valueOf() - dayjs(b.lastOper).valueOf(),
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
      render: (value) => formatNumber(value),
    },
    {
      title: t('deposit.columns.yandexSum'),
      dataIndex: 'yandexSum',
      key: 'yandexSum',
      render: currencyRender,
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'devices-deposit-table-columns');

  const calculateTotals = () => {
    if (!devices || devices.length === 0) return null;

    const totals: any = {
      id: 'total-row',
      name: t('finance.total'),
      city: '',
      lastOper: '',
      cashSum: 0,
      virtualSum: 0,
      cashbackSumCard: 0,
      discountSum: 0,
      counter: 0,
      yandexSum: 0,
    };

    devices.forEach(item => {
      totals.cashSum += item.cashSum || 0;
      totals.virtualSum += item.virtualSum || 0;
      totals.cashbackSumCard += item.cashbackSumCard || 0;
      totals.discountSum += item.discountSum || 0;
      totals.counter += item.counter || 0;
      totals.yandexSum += item.yandexSum || 0;
    });

    return totals;
  };

  const totalsRow = calculateTotals();

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.depositDevices')}
        </span>
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
          summary={() => {
            if (!totalsRow) return null;
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  {visibleColumns.map((col, index) => {
                    const dataIndex = 'dataIndex' in col ? (col.dataIndex as string) : undefined;
                    let value: React.ReactNode = '';

                    if (index === 0) {
                      return (
                        <Table.Summary.Cell key={col.key?.toString() || index} index={index}>
                          <span className="font-bold">{t('finance.total')}</span>
                        </Table.Summary.Cell>
                      );
                    }

                    if (dataIndex) {
                      if (dataIndex === 'name' || dataIndex === 'city' || dataIndex === 'lastOper') {
                        value = '';
                      } else if (dataIndex === 'counter') {
                        value = formatNumber(totalsRow[dataIndex]);
                      } else if (
                        ['cashSum', 'virtualSum', 'cashbackSumCard', 'discountSum', 'yandexSum'].includes(dataIndex)
                      ) {
                        value = currencyRender(totalsRow[dataIndex]);
                      }
                    }

                    return (
                      <Table.Summary.Cell key={col.key?.toString() || index} index={index}>
                        <span className="font-bold">{value}</span>
                      </Table.Summary.Cell>
                    );
                  })}
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
    </>
  );
};

export default Deposit;
