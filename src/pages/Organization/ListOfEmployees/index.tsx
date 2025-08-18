import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import useSWR from 'swr';
import { getWorkers, WorkerResponse } from '@/services/api/equipment';
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

const ListOfEmployees: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
  const [isModalOpenCreation, setIsModalOpenCreation] = useState(false);
  const [workerId, setWorkerId] = useState(0);
  const userPermissions = usePermissions();

  const { data: workerData, isLoading: loadingWorkers } = useSWR(
    [`get-worker`],
    () => getWorkers(),
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
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
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
      title: 'Работает с',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  if (allowed) {
    columnsEmployees.push({
      title: '',
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
            <div className='hidden sm:flex'>{t('routes.add')}</div>
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
          pagination={false}
          loading={loadingWorkers}
          scroll={{ x: 'max-content' }}
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
