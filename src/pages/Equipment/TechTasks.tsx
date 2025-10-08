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
import { Table, Modal, Button, Checkbox } from 'antd';
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
import { useToast } from '@/hooks/useToast';
import ColumnSelectorV2 from '@/components/ui/Table/ColumnSelectorV2';
import FilterTechTasks from '@/components/ui/Filter/FilterTechTasks';
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
  const name = searchParams.get('name') || undefined;
  const tags = searchParams.get('tags')?.split(',').map(tag => tag.trim()) || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const swrKey = useMemo(
    () => `get-tech-tasks-${currentPage}-${pageSize}-${posId}-${status}-${name}-${tags?.join(',')}-${startDate}-${endDate}`,
    [currentPage, pageSize, posId, status, name, tags, startDate, endDate]
  );

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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
        name: name,
        tags: tags,
        startDate: startDate,
        endDate: endDate,
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

  const handleBulkDelete = () => {
    const selectedTasks = techTasks.filter(task => selectedRowKeys.includes(task.id));
    const taskNames = selectedTasks.map(task => task.name).join(', ');
    
    Modal.confirm({
      title: t('constants.confirm'),
      content: `Are you sure you want to delete ${selectedTasks.length} tech task(s): "${taskNames}"?`,
      okText: t('marketing.delete'),
      okType: 'danger',
      cancelText: t('organizations.cancel'),
      async onOk() {
        try {
          for (const taskId of selectedRowKeys) {
            await deleteTechTask(Number(taskId));
          }
          setSelectedRowKeys([]);
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
      title: (
        <Checkbox
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < techTasks.length}
          checked={techTasks.length > 0 && selectedRowKeys.length === techTasks.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys(techTasks.map(task => task.id));
            } else {
              setSelectedRowKeys([]);
            }
          }}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 50,
      render: (_: unknown, record: TechTaskReadAll) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.id]);
            } else {
              setSelectedRowKeys(selectedRowKeys.filter(key => key !== record.id));
            }
          }}
        />
      ),
    },
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

  const { ColumnSelector, visibleColumns } = ColumnSelectorV2({
    columns: columnsTechTasks,
    storageKey: 'tech-tasks-columns-v2',
  });

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.technicalTasks')}
          </span>
        </div>
      </div>
        <FilterTechTasks />
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          {ColumnSelector}
          {selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              className="ml-4"
            >
              {t('marketing.delete')} ({selectedRowKeys.length})
            </Button>
          )}
        </div>
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
