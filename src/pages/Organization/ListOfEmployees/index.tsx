import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import useSWR from 'swr';
import {
  getWorkers,
  getWorkersCount,
  WorkerResponse,
} from '@/services/api/equipment';
import { usePermissions } from '@/hooks/useAuthStore';
import { Button, Table, Tooltip } from 'antd';
import hasPermission from '@/permissions/hasPermission';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import AntDButton from 'antd/es/button';
import { ColumnsType } from 'antd/es/table';
import { getStatusTagRender } from '@/utils/tableUnits';
import EmployeeCreationModal from './EmployeeCreationModal';
import EmployeeUpdateModal from './EmployeeUpdateModal';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useUser } from '@/hooks/useUserStore';

const ListOfEmployees: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
  const [isModalOpenCreation, setIsModalOpenCreation] = useState(false);
  const [workerId, setWorkerId] = useState(0);
  const userPermissions = usePermissions();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const filterParams = useMemo(
    () => ({
      organizationId: user.organizationId,
      page: currentPage,
      size: pageSize,
    }),
    [user, currentPage, pageSize]
  );

  const swrKey = useMemo(() => {
    return ['get-worker', filterParams.organizationId, filterParams.page, filterParams.size];
  }, [filterParams]);

  const { data: workerData, isLoading: loadingWorkers } = useSWR(
    user.organizationId ? swrKey : null,
    () => {
      return getWorkers(Number(user.organizationId!)!, {
        page: currentPage,
        size: pageSize,
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: workerCount } = useSWR(
    user.organizationId ? [`get-workers-count`, user.organizationId] : null,
    () => getWorkersCount(Number(user.organizationId!)!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const workers =
    workerData?.map(item => ({
      ...item,
      name: `${item.surname} ${item.name} ${item.middlename}`,
      status: t(`tables.${item.status}`),
      createdAt: item.createAt
        ? new Date(item.createAt).toLocaleDateString('ru-RU')
        : 'N/A',
    })) || [];

  const handleUpdate = (rowId: number) => {
    setWorkerId(rowId);
    setIsModalOpenUpdate(true);
  };

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Organization' },
    { action: 'update', subject: 'Organization' },
  ]);

  const statusRender = getStatusTagRender(t);

  const columnsEmployees: ColumnsType<WorkerResponse> = [
    {
      title: 'ФИО Сотрудника',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Роль СRM',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: statusRender,
    },
    {
      title: 'Дата регистарции',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  if (allowed) {
    columnsEmployees.push({
      title: 'Редактировать',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: { id: number }) => (
        <Tooltip title="Редактировать">
          <AntDButton
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: '24px' }}
          />
        </Tooltip>
      ),
    });
  }

  const {
    checkedList,
    setCheckedList,
    options: columnOptions,
    visibleColumns,
  } = useColumnSelector(columnsEmployees, 'employees-columns');

  const onCloseCreation = () => {
    setIsModalOpenCreation(false);
  };

  const onCloseUpdate = () => {
    setIsModalOpenUpdate(false);
  };

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.listOf')}
          </span>
          <QuestionMarkIcon />
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setIsModalOpenCreation(true)}
          >
            <div className="hidden sm:flex">{t('routes.add')}</div>
          </Button>
        )}
      </div>
      <div className="mt-5">
        <Notification
          title={t('roles.access')}
          message={t('roles.change')}
          message2={t('roles.then')}
          showEmp={true}
        />
        <ColumnSelector
          checkedList={checkedList}
          options={columnOptions}
          onChange={setCheckedList}
        />
        <Table
          dataSource={workers}
          columns={visibleColumns}
          loading={loadingWorkers}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: workerCount?.count,
            pageSizeOptions: ALL_PAGE_SIZES,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} операций`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
        />
        <EmployeeUpdateModal
          open={isModalOpenUpdate}
          onClose={onCloseUpdate}
          workerId={workerId}
        />
        <EmployeeCreationModal
          open={isModalOpenCreation}
          onClose={onCloseCreation}
        />
      </div>
    </div>
  );
};

export default ListOfEmployees;
