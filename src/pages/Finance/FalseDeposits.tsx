import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import {
  FalseDepositResponse,
  getFalseDepositDevice,
} from '@/services/api/pos';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import useSWR from 'swr';

const FalseDeposits: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const formattedDate = dayjs().format('YYYY-MM-DD');

  const posId = Number(searchParams.get('posId') || 0);
  const dateStart = searchParams.get('dateStart') || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate} 23:59`;
  
  const filterParams = useMemo(
    () => ({
      dateStart,
      dateEnd,
      posId,
    }),
    [dateStart, dateEnd, posId]
  );

  const swrKey = useMemo(() => {
    if (posId === 0) return null;
    return [
      'get-false-deposits-pos-devices',
      posId,
      filterParams.dateStart,
      filterParams.dateEnd,
    ];
  }, [posId, filterParams]);

  const { data: filterData, isLoading } = useSWR(
    posId !== 0 ? swrKey : null,
    () =>
      getFalseDepositDevice(posId, {
        dateStart: new Date(filterParams.dateStart),
        dateEnd: new Date(filterParams.dateEnd),
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const columnsFalseDeposit: ColumnsType<FalseDepositResponse> =
    [
      {
        title: t('equipment.device'),
        dataIndex: 'deviceName',
        key: 'deviceName',
        render: (text, record) => {
          return (
            <Link
              to={{
                pathname: '/finance/debugging/false/deposit',
                search: `?deviceId=${record.deviceId}&dateStart=${dayjs(record.operDay).toDate().toISOString()}&dateEnd=${dayjs(record.operDay).add(1, 'day').toISOString()}`,
              }}
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              {text}
            </Link>
          );
        },
      },
      {
        title: t('table.headers.numberFalse'),
        dataIndex: 'falseOperCount',
        key: 'falseOperCount',
      },
      {
        title: t('calendar.DAY'),
        dataIndex: 'operDay',
        key: 'operDay',
        render: (val) => dayjs(val).format('YYYY-MM-DD'),
      },
    ];

  const falseDeposits = useMemo(() => {
    return (
      filterData?.sort(
        (a, b) => new Date(a.operDay).getTime() - new Date(b.operDay).getTime()
      ) || []
    );
  }, [filterData]);

  return (
    <div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.falseDeposits')}
        </span>
      </div>

      <GeneralFilters count={0} display={['pos', 'dateTime']} />

      <div className="mt-8">
        <Table
          rowKey="id"
          dataSource={falseDeposits}
          columns={columnsFalseDeposit}
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default FalseDeposits;
