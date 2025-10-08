import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import {
  getPoses,
  getTechTaskExecution,
  StatusTechTask,
  TechTaskReadAll,
  deleteTechTask,
  bulkDeleteTechTasks,
  BulkDeleteTechTasksBody,
} from '@/services/api/equipment';
import useSWR from 'swr';
import { Table, Modal, Button, Checkbox, Input } from 'antd';
import { DeleteOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
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
  const [searchValue, setSearchValue] = useState(name || '');

  const user = useUser()

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        name: value || undefined,
        page: '1',
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    setSearchValue(name || '');
  }, [name]);

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
    const taskIds = selectedRowKeys.map(key => Number(key));
    
    Modal.confirm({
      title: t('techTasks.confirmDelete'),
      content: t('techTasks.confirmDeleteMessage', { count: selectedTasks.length }),
      okText: t('techTasks.delete'),
      okType: 'danger',
      cancelText: t('organizations.cancel'),
      async onOk() {
        try {
          if (!user.organizationId) {
            showToast(t('errors.other.unexpectedErrorOccurred'), 'error');
            return;
          }
          
          const bulkDeleteBody: BulkDeleteTechTasksBody = {
            ids: taskIds,
            ...(posId && { posId }),
            organizationId: user.organizationId,
          };
          
          await bulkDeleteTechTasks(bulkDeleteBody);
          setSelectedRowKeys([]);
          await mutate();
          showToast(t('techTasks.deleteSuccess'), 'success');
        } catch (error) {
          showToast(t('techTasks.deleteError'), 'error');
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
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
      title: t('techTasks.columns.number'),
      dataIndex: 'id',
      key: 'id',
      width: 60,
      fixed: 'left',
    },
    {
      title: t('techTasks.columns.carWashBranch'),
      dataIndex: 'posName',
      key: 'posName',
      width: 200,
      minWidth: 150,
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
      title: t('techTasks.columns.workName'),
      dataIndex: 'name',
      key: 'name',
      width: 250,
      minWidth: 200,
    },
    {
      title: t('techTasks.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      minWidth: 100,
      render: renderStatus,
    },
    {
      title: t('techTasks.columns.workType'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      minWidth: 100,
    },
    {
      title: t('techTasks.columns.tags'),
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      minWidth: 120,
      render: value => getTagRender(value),
    },
    {
      title: t('techTasks.columns.deadline'),
      dataIndex: 'endSpecifiedDate',
      key: 'endSpecifiedDate',
      width: 150,
      minWidth: 120,
      render: dateRender,
    },
    {
      title: t('techTasks.columns.actions'),
      dataIndex: 'actions',
      key: 'actions',
      width: 120,
      minWidth: 100,
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
      <div className="ml-4 sm:ml-8 md:ml-12 lg:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-text01">
            {t('routes.technicalTasks')}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-4 sm:px-8 md:px-12 lg:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Input.Search
            placeholder={t('techTasks.searchPlaceholder')}
            value={searchValue}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            allowClear
            className="w-full sm:w-80"
            style={{ height: '32px' }}
          />
          <div style={{ height: '32px' }}>
            <FilterTechTasks />
          </div>
          <div style={{ height: '32px' }}>
            {ColumnSelector}
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="btn-primary"
          style={{ height: '32px' }}
        >
          <span className="hidden sm:inline">{t('techTasks.createTask')}</span>
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full max-w-full">
          <Table
            dataSource={techTasks}
            columns={visibleColumns}
            loading={techTasksLoading || isInitialLoading}
            scroll={{ x: 'max-content' }}
            className="responsive-table"
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
              responsive: true,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </div>
      </div>

      {selectedRowKeys.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] mx-4">
          <div className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 sm:gap-4">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setSelectedRowKeys([])}
              className="text-white hover:text-gray-200 p-0 h-auto"
            />
            <span className="text-xs sm:text-sm font-medium ml-1 sm:ml-2">
              {t('techTasks.selectedTasks', { count: selectedRowKeys.length })}
            </span>
            <div className="w-px h-4 bg-white mx-2 sm:mx-4"></div>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              className="text-white hover:text-gray-200 p-0 h-auto"
            >
              {t('techTasks.delete')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default TechTasks;
