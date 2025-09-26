import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPoses,
  getTechTaskManage,
  TechTaskManagerInfo,
} from '@/services/api/equipment';
import useSWR from 'swr';
import { Table, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  getDateRender,
  getStatusTagRender,
  getTagRender,
} from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import TechTaskForm from './TechTaskForm';
import Button from 'antd/es/button';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';

const TechTaskCreate: React.FC = () => {
  const { t } = useTranslation();
  const userPermissions = usePermissions();
  const [techTaskToEdit, setTechTaskToEdit] =
    useState<TechTaskManagerInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUpdate = (id: number) => {
    setDrawerOpen(true);
    setTechTaskToEdit(
      techTasks.find(tech => tech.id === id) || ({} as TechTaskManagerInfo)
    );
  };
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = Number(searchParams.get('posId')) || undefined;

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data, isLoading: techTasksLoading } = useSWR(
    [`get-tech-tasks`, currentPage, pageSize, posId],
    () =>
      getTechTaskManage({
        posId: posId,
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

  const techTasks =
    data?.techTaskManageInfo.map(item => ({
      ...item,
      type: t(`tables.${item.type}`),
      posName: poses?.find(pos => pos.id === item.posId)?.name,
      status:
        item.status === 'ACTIVE'
          ? t(`tables.In Progress`)
          : item.status === 'FINISHED'
            ? t(`tables.Done`)
            : t(`tables.${item.status}`),
    })) || [];

  const renderStatus = getStatusTagRender(t);
  const dateRender = getDateRender();

  const columnsTechTasks: ColumnsType<TechTaskManagerInfo> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Автомойка/ Филиал',
      dataIndex: 'posName',
      key: 'posName',
    },
    {
      title: 'Наименование работ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Периодичность',
      dataIndex: 'period',
      key: 'period',
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
    {
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: { id: number }) => (
        <Tooltip title="Редактировать">
          <Button
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: '24px' }}
          />
        </Tooltip>
      ),
    },
  ];

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      posId: undefined,
    });
  };

  const {
    checkedList,
    setCheckedList,
    options: optionsColumns,
    visibleColumns,
  } = useColumnSelector(columnsTechTasks, 'tech-tasks-create-columns');

  const onEdit = () => {
    setTechTaskToEdit(null);
  };

  const onClose = () => {
    setDrawerOpen(false);
  };

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'TechTask' },
    { action: 'create', subject: 'TechTask' },
  ]);

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.createTask')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <div className='hidden sm:flex'>{t('routes.add')}</div>
          </Button>
        )}
      </div>
      <GeneralFilters
        count={data?.totalCount || 0}
        display={['pos', 'reset']}
        onReset={resetFilters}
      />
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={optionsColumns}
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
          scroll={{ x: 'max-content' }}
        />
      </div>
      <TechTaskForm
        techTaskToEdit={techTaskToEdit}
        onEdit={onEdit}
        isOpen={drawerOpen}
        onClose={onClose}
      />
    </>
  );
};

export default TechTaskCreate;
