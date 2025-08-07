import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPoses,
  getTechTaskExecution,
  StatusTechTask,
  TechTaskReadAll,
} from '@/services/api/equipment';
import useSWR from 'swr';
import { Select, Table } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  getDateRender,
  getStatusTagRender,
  getTagRender,
} from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';

const TechTasks: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const posId = Number(searchParams.get('posId')) || undefined;
  const status = (searchParams.get('status') as StatusTechTask) || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const swrKey = useMemo(
    () => `get-tech-tasks-${currentPage}-${pageSize}-${posId}-${status}`,
    [currentPage, pageSize, posId, status]
  );

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data, isLoading: techTasksLoading } = useSWR(
    swrKey,
    () =>
      getTechTaskExecution({
        posId: posId,
        status: status,
        page: currentPage,
        size: pageSize,
      }).finally(() => {
        setIsInitialLoading(false);
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: poses } = useSWR([`get-pos`], () => getPoses({}), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const techTasks = useMemo(
    () =>
      data?.techTaskReadAll?.map(item => ({
        ...item,
        type: t(`tables.${item.type}`),
        posName: poses?.find(pos => pos.id === item.posId)?.name,
        status: t(`tables.${item.status}`),
      })) || [],
    [data, poses, t]
  );

  const renderStatus = getStatusTagRender(t);
  const dateRender = getDateRender();

  const statuses = [
    { name: t('tables.ACTIVE'), value: StatusTechTask.ACTIVE },
    { name: t('tables.OVERDUE'), value: StatusTechTask.OVERDUE },
  ];

  const columnsTechTasks: ColumnsType<TechTaskReadAll> = [
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
              pathname: '/equipment/technical/tasks/list/item',
              search: `?techTaskId=${record.id}&status=${record.status}&name=${record.name}`,
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
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: 'Тип работы',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Теги',
      dataIndex: 'tags',
      key: 'tags',
      render: value => getTagRender(value),
    },
    {
      title: 'Дата начала работ',
      dataIndex: 'startDate',
      key: 'startDate',
      render: dateRender,
    },
  ];

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      status: undefined,
      posId: undefined,
    });
  };

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsTechTasks, 'tech-tasks-columns');

  return (
    <>
      <GeneralFilters
        count={data?.totalCount || 0}
        display={['pos', 'reset']}
        onReset={resetFilters}
      >
        <div>
          <div className="text-sm text-text02">{t('constants.status')}</div>
          <Select
            className="w-full sm:w-80 h-10"
            options={statuses}
            value={searchParams.get('status') || null}
            onChange={value => {
              updateSearchParams(searchParams, setSearchParams, {
                status: value,
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
          dataSource={techTasks.sort((a, b) => a.id - b.id)}
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

export default TechTasks;
