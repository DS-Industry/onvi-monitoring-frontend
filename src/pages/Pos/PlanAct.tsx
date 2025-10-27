import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

import { getPlanFact } from '@/services/api/pos';
import { getPoses } from '@/services/api/equipment';

import { Table } from 'antd';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';

import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { getCurrencyRender } from '@/utils/tableUnits';
import TableUtils from '@/utils/TableUtils.tsx';

import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore';

interface PlanFact {
  posId: number;
  posName?: string;
  plan: number;
  cashFact: number;
  virtualSumFact: number;
  yandexSumFact: number;
  sumFact: number;
  completedPercent: number;
  notCompletedPercent: number;
}

const PlanAct: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = dayjs().format('YYYY-MM-DD');

  const posId = Number(searchParams.get('posId')) || undefined;
  const placementId = Number(searchParams.get('city')) || undefined;
  const dateStart = searchParams.get('dateStart') || `${today} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${today} 23:59`;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const filterParams = useMemo(
    () => ({
      posId,
      placementId,
      dateStart,
      dateEnd,
      page: currentPage,
      size: pageSize,
    }),
    [posId, placementId, dateStart, dateEnd, currentPage, pageSize]
  );

  const swrKey = useMemo(() => {
    return [
      'get-program-devices',
      filterParams.posId,
      filterParams.placementId,
      filterParams.dateStart,
      filterParams.dateEnd,
      filterParams.page,
      filterParams.size,
    ];
  }, [filterParams]);

  const { data: planFactData, isLoading: isPlanLoading } = useSWR(
    swrKey,
    () =>
      getPlanFact({
        posId,
        placementId,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        page: currentPage,
        size: pageSize,
      }).finally(() => setIsInitialLoading(false)),
    {
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: posList } = useSWR(
    user.organizationId
      ? ['get-poses', placementId, user.organizationId]
      : null,
    () =>
      getPoses({
        placementId: placementId,
        organizationId: user.organizationId,
      }),
    { keepPreviousData: true, shouldRetryOnError: false }
  );

  const totalCount = planFactData?.totalCount || 0;

  const planFacts = useMemo(() => {
    return (
      planFactData?.plan?.map((item: PlanFact) => ({
        ...item,
        posName:
          posList?.find(p => p.id === item.posId)?.name || `POS ${item.posId}`,
      })) || []
    );
  }, [planFactData, posList]);

  const currencyRender = getCurrencyRender();

  const columnsPlanFact: ColumnsType<PlanFact> = [
    {
      title: t('table.columns.id'),
      dataIndex: 'posId',
      key: 'posId',
      sorter: (a, b) => a.posId - b.posId,
    },
    {
      title: t('hr.name'),
      dataIndex: 'posName',
      key: 'posName',
    },
    {
      title: t('table.headers.plan'),
      dataIndex: 'plan',
      key: 'plan',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.cash'),
      dataIndex: 'cashFact',
      key: 'cashFact',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.cashless'),
      dataIndex: 'virtualSumFact',
      key: 'virtualSumFact',
      render: currencyRender,
    },
    {
      title: t('deposit.columns.yandexSum'),
      dataIndex: 'yandexSumFact',
      key: 'yandexSumFact',
      render: currencyRender,
    },
    {
      title: t('table.headers.factSummary'),
      dataIndex: 'sumFact',
      key: 'sumFact',
      render: currencyRender,
    },
    {
      title: t('table.headers.planCompleted'),
      dataIndex: 'completedPercent',
      key: 'completedPercent',
      render: (_value, record) =>
        TableUtils.createPercentFormat(record.completedPercent),
    },
    {
      title: t('table.headers.planNotCompleted'),
      dataIndex: 'notCompletedPercent',
      key: 'notCompletedPercent',
      render: (_value, record) =>
        TableUtils.createPercentFormat(record.notCompletedPercent),
    },
  ];

  const {
    checkedList,
    setCheckedList,
    options: columnOptions,
    visibleColumns,
  } = useColumnSelector(columnsPlanFact, 'plan-fact-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.planAct')}
        </span>
      </div>

      <GeneralFilters
        count={totalCount}
        display={['pos', 'city', 'dateTime']}
      />

      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={columnOptions}
          onChange={setCheckedList}
        />

        <Table
          rowKey="posId"
          dataSource={planFacts}
          columns={visibleColumns}
          loading={isPlanLoading || isInitialLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} записей`,
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

export default PlanAct;
