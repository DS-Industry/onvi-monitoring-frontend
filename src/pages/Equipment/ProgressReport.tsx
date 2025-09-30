import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  getPoses,
  getTechTaskReport,
  getWorkers,
  TechTaskReadAll,
  TypeTechTask,
} from '@/services/api/equipment';
import { Select, Table } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { ColumnsType } from 'antd/es/table';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useUser } from '@/hooks/useUserStore';

const ProgressReport: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = Number(searchParams.get('posId')) || undefined;
  const type = (searchParams.get('type') as TypeTechTask) || undefined;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const swrKey = useMemo(
    () => `get-tech-tasks-${currentPage}-${pageSize}-${posId}-${type}`,
    [currentPage, pageSize, posId, type]
  );

  const { data, isLoading: techTasksLoading } = useSWR(
    swrKey,
    () =>
      getTechTaskReport({
        posId: posId,
        type: type,
        page: currentPage,
        size: pageSize,
      }).finally(() => {
        setIsInitialLoading(false);
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { data: poses } = useSWR([`get-pos`], () => getPoses({}), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false
  });

  const user = useUser();

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const techTasks =
    data?.techTaskReadAll?.map(item => ({
      ...item,
      posName: poses?.find(pos => pos.id === item.posId)?.name || '-',
      type: t(`tables.${item.type}`),
      status: t(`tables.${item.status}`),
      executorName: workerData?.find((work) => work.id === item.executorId)?.name || "-"
    })) || [];

  const statusRender = getStatusTagRender(t);
  const dateRender = getDateRender();

  const columnsTechTasksRead: ColumnsType<TechTaskReadAll> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Автомойка/ Филиал',
      dataIndex: 'posName',
      key: 'posName',
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/equipment/technical/tasks/progress/item',
              search: `?progressReportId=${record.id}&status=${record.status}&type=${record.type}&name=${record.name}&endDate=${record.endSpecifiedDate}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: 'Наименование работ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Периодичность',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: statusRender,
    },
    {
      title: 'Дата начала',
      dataIndex: 'startWorkDate',
      key: 'startWorkDate',
      render: dateRender,
    },
    {
      title: 'Дата окончания',
      dataIndex: 'sendWorkDate',
      key: 'sendWorkDate',
      // render: dateRender,
    },
    {
      title: 'Исполнитель',
      dataIndex: 'executorName',
      key: 'executorName',
    },
  ];

  const techTasksTypes = [
    { label: t('tables.REGULAR'), value: TypeTechTask.REGULAR },
    { label: t('tables.ONETIME'), value: TypeTechTask.ONETIME },
  ];

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      type: undefined,
      posId: undefined,
    });
  };

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsTechTasksRead, 'progress-report-table-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.progress')}
          </span>
        </div>
      </div>
      <GeneralFilters
        count={data?.totalCount || 0}
        display={['pos', 'reset']}
        onReset={resetFilters}
      >
        <div>
          <div className="block mb-1 text-sm font-medium text-gray-700">
            {t('constants.status')}
          </div>
          <Select
            className="w-full sm:w-80"
            options={techTasksTypes}
            value={searchParams.get('type') || null}
            onChange={value => {
              updateSearchParams(searchParams, setSearchParams, {
                type: value,
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
        <Table<TechTaskReadAll>
          dataSource={techTasks}
          columns={visibleColumns}
          loading={techTasksLoading || isInitialLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.totalCount || 0,
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

export default ProgressReport;
