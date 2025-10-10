import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import useSWR from 'swr';
import {
  getPoses,
  getTechTaskReport,
  getWorkers,
  StatusTechTask,
} from '@/services/api/equipment';
import { Table, Input } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { ColumnsType } from 'antd/es/table';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import ColumnSelectorV2 from '@/components/ui/Table/ColumnSelectorV2';
import FilterTechTasks from './TechTasks/FilterTechTasks';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
import { TechTaskReadAllDisplay } from '@/types/techTaskDisplay';

const ProgressReport: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = Number(searchParams.get('posId')) || undefined;
  const status = (searchParams.get('status') as StatusTechTask) || undefined;
  const name = searchParams.get('name') || undefined;
  const tags = searchParams.get('tags')?.split(',').map(tag => tag.trim()) || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const assigned = searchParams.get('assigned') || undefined;
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(name || '');

  const swrKey = useMemo(
    () => `get-tech-tasks-report-${currentPage}-${pageSize}-${posId}-${status}-${name}-${tags?.join(',')}-${startDate}-${endDate}-${assigned}`,
    [currentPage, pageSize, posId, status, name, tags, startDate, endDate, assigned]
  );

  const user = useUser();

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

  const { data, isLoading: techTasksLoading } = useSWR(
    user.organizationId ? swrKey : null,
    () =>
      getTechTaskReport({
        posId: posId,
        status: status,
        page: currentPage,
        size: pageSize,
        organizationId: user.organizationId,
        name: name,
        tags: tags,
        startDate: startDate,
        endDate: endDate,
        executorId: assigned ? Number(assigned) : undefined,
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

  const techTasks: TechTaskReadAllDisplay[] =
    data?.techTaskReadAll?.map(item => ({
      ...item,
      posName: poses?.find(pos => pos.id === item.posId)?.name || '-',
      type: t(`tables.${item.type}`),
      status: t(`tables.${item.status}`),
      executorName: workerData?.find((work) => work.id === item.executorId)?.name || "-"
    })) || [];

  const statusRender = getStatusTagRender(t);
  const dateRender = getDateRender();

  const assigneeRender = (record: {
    firstName: string;
    lastName: string;
    id: number;
  }) => {
    const firstName = record.firstName || ""
    const lastName = record.lastName || ""
    
    const initials = 
      (firstName?.[0]?.toUpperCase() || '') + 
      (lastName?.[0]?.toUpperCase() || '') || ""

    const avatarColors = getAvatarColorClasses(record.id);

    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${avatarColors}`}>
          <span className="text-xs font-medium">
            {initials}
          </span>
        </div>
        <span className="text-sm">{firstName} {lastName}</span>
      </div>
    );
  };

  const columnsTechTasksRead: ColumnsType<TechTaskReadAllDisplay> = [
    {
      title: t('progressReport.columns.number'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('progressReport.columns.carWashBranch'),
      dataIndex: 'posName',
      key: 'posName',
    },
    {
      title: t('progressReport.columns.workName'),
      dataIndex: 'name',
      key: 'name',
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
      title: t('progressReport.columns.frequency'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('progressReport.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: statusRender,
    },
    {
      title: t('progressReport.columns.startDate'),
      dataIndex: 'startWorkDate',
      key: 'startWorkDate',
      render: dateRender,
    },
    {
      title: t('progressReport.columns.endDate'),
      dataIndex: 'sendWorkDate',
      key: 'sendWorkDate',
      render: dateRender,
    },
    {
      title: t('progressReport.columns.assignee'),
      dataIndex: 'executor',
      key: 'executor',
      render: assigneeRender,
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const { ColumnSelector, visibleColumns } = ColumnSelectorV2({
    columns: columnsTechTasksRead,
    storageKey: 'progress-report-columns-v2',
  });

  return (
    <>
      <div className="ml-10 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-text01">
            {t('routes.progress')}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4 mb-6 px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <Input.Search
            placeholder={t('techTasks.searchPlaceholder')}
            value={searchValue}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            allowClear
            className="w-full sm:w-72 md:w-80"
            style={{ height: '32px' }}
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <div style={{ height: '32px' }}>
              <FilterTechTasks display={['assigned', 'tags', 'dateRange', 'branch']} />
            </div>
            <div style={{ height: '32px' }}>
              {ColumnSelector}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full max-w-full">
          <Table<TechTaskReadAllDisplay>
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
                `${range[0]}-${range[1]} / ${total}`,
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
    </>
  );
};

export default ProgressReport;
