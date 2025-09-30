import React from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import useSWR from 'swr';
import { getRoles } from '@/services/api/organization';
import { Table } from 'antd';

const ListOfRoles: React.FC = () => {
  const { t } = useTranslation();

  const { data: rolesData, isLoading: loadingRoles } = useSWR(
    [`get-role`],
    () => getRoles(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const roles = rolesData || [];

  const columnsRoles = [
    {
      title: 'Роль СRM',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Права доступа',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.listRoles')}
        </span>
      </div>
      <Notification
        title={t('roles.access')}
        message={t('roles.the')}
        showEmp={true}
      />
      <Table
        dataSource={roles}
        columns={columnsRoles}
        loading={loadingRoles}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ListOfRoles;
