import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPoses,
  getTechTaskExecution,
  StatusTechTask,
  TechTaskReadAll,
  deleteTechTask,
} from '@/services/api/equipment';
import useSWR from 'swr';
import { Select, Table, Modal, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getStatusTagRender, getTagRender } from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { useToast } from '@/hooks/useToast';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/ru';
import { useUser } from '@/hooks/useUserStore';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.locale('ru');

const TechTasks: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
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

  const user = useUser()

  const { data, isLoading: techTasksLoading, mutate } = useSWR(
    user.organizationId ? swrKey : null,
    () =>
      getTechTaskExecution({
        posId: posId,
        status: status,
        page: currentPage,
        size: pageSize,
        organizationId: user.organizationId,
      }).finally(() => {
        setIsInitialLoading(false);
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: poses } = useSWR([`get-pos`], () => getPoses({}), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const techTasks = useMemo(
    () =>
      data?.techTaskReadAll?.map(item => ({
        ...item,
        type: t(`tables.${item.type}`),
        posName: poses?.find(pos => pos.id === item.posId)?.name,
        status:
          item.status === StatusTechTask.ACTIVE
            ? t('tables.PENDING')
            : t(`tables.${item.status}`),
      })) || [],
    [data, poses, t]
  );

  const renderStatus = getStatusTagRender(t);

  const dateRender = (dateString: string) => {
    if (!dateString) return '-';

    const date = dayjs(dateString);
    const today = dayjs().startOf('day');
    const in7Days = today.add(7, 'day');

    if (date.isBetween(today, in7Days, null, '[]')) {
      return date.format('dddd');
    }

    return date.format('D MMMM YYYY');
  };

  const statuses = [
    { label: t('tables.ACTIVE'), value: StatusTechTask.ACTIVE },
    { label: t('tables.OVERDUE'), value: StatusTechTask.OVERDUE },
  ];

  const handleDelete = (id: number, name: string) => {
    Modal.confirm({
      title: t('constants.confirm'),
      content: `Are you sure you want to delete "${name}"?`,
      okText: t('marketing.delete'),
      okType: 'danger',
      cancelText: t('organizations.cancel'),
      async onOk() {
        try {
          await deleteTechTask(id);
          await mutate();
          showToast(t('success.recordDeleted'), 'success');
        } catch (error) {
          showToast(t('errors.other.unexpectedErrorOccurred'), 'error');
        }
      },
    });
  };

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
      title: 'Крайний срок',
      dataIndex: 'endSpecifiedDate',
      key: 'endSpecifiedDate',
      render: dateRender,
    },
    {
      title: 'Действия',
      dataIndex: 'actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: TechTaskReadAll) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id, record.name)}
          title={t('marketing.delete')}
          size="small"
        />
      ),
    },
  ];

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      status: undefined,
      posId: undefined,
    });
  };

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsTechTasks, 'tech-tasks-columns-v2');

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.technicalTasks')}
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

export default TechTasks;
