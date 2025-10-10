import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Table, Button, Grid } from 'antd';
import { ColumnsType } from 'antd/es/table';
import EmployeeSalaryFilter from '@/components/ui/Filter/EmployeeSalaryFilter';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import {
  getPositions,
  getPrepayments,
  getPrepaymentsCount,
  getWorkers,
  PrepaymentResponse,
} from '@/services/api/hr';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from '@/utils/constants';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';
import { updateSearchParams } from '@/utils/searchParamsUtils';

import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';

type TablePayment = PrepaymentResponse & {
  hrPosition?: string;
};

const EmployeeAdvance: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userPermissions = usePermissions();
  const user = useUser();

  const screens = Grid.useBreakpoint();

  const { data: positionData } = useSWR(
    [`get-positions`],
    () => getPositions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const positions: { name: string; value: number; label: string }[] =
    positionData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
      label: item.props.name,
    })) || [];

  const startPaymentDateParam = searchParams.get('startPaymentDate');
  const endPaymentDateParam = searchParams.get('endPaymentDate');
  const workerId = Number(searchParams.get('hrWorkerId')) || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const startPaymentDate = startPaymentDateParam
    ? new Date(startPaymentDateParam)
    : undefined;
  const endPaymentDate = endPaymentDateParam
    ? new Date(endPaymentDateParam)
    : undefined;

  const { data: paymentsData, isLoading: paymentsLoading } = useSWR(
    [
      'get-payments',
      startPaymentDate,
      endPaymentDate,
      workerId,
      currentPage,
      pageSize,
    ],
    () =>
      getPrepayments({
        startPaymentDate: startPaymentDate,
        endPaymentDate: endPaymentDate,
        hrWorkerId: workerId,
        page: currentPage,
        size: pageSize,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const payments =
    paymentsData?.map(pay => ({
      ...pay,
      hrPosition: positions.find(pos => pos.value === pay.hrPositionId)?.name,
    })) || [];

  const { data: countData } = useSWR(
    ['get-payments-count', startPaymentDate, endPaymentDate, workerId],
    () =>
      getPrepaymentsCount({
        startPaymentDate: startPaymentDate,
        endPaymentDate: endPaymentDate,
        hrWorkerId: workerId,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: workersData } = useSWR(
    user.organizationId ? ['get-workers', user.organizationId] : null,
    () =>
      getWorkers({
        organizationId: user.organizationId,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const workers: { name: string; value?: number }[] =
    workersData?.map(work => ({
      name: work.props.name,
      value: work.props.id,
    })) || [];

  const totalCount = countData?.count || 0;

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columnsEmployee: ColumnsType<TablePayment> = [
    {
      title: 'ФИО',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Должность',
      dataIndex: 'hrPosition',
      key: 'hrPosition',
      render: value => value || '-',
    },
    {
      title: 'Расчетный месяц',
      dataIndex: 'billingMonth',
      key: 'billingMonth',
      render: (_, record) =>
        record.billingMonth ? dayjs(record.billingMonth).format('MM.YYYY') : '',
    },
    {
      title: 'Дата выдачи',
      dataIndex: 'payoutTimestamp',
      key: 'payoutTimestamp',
      render: dateRender,
    },
    {
      title: 'Посменное начисление',
      dataIndex: 'dailySalary',
      key: 'dailySalary',
      sorter: (a, b) => a.dailySalary - b.dailySalary,
      render: currencyRender,
    },
    {
      title: t('validation.bonusPayout'),
      dataIndex: 'bonusPayout',
      key: 'bonusPayout',
      render: currencyRender,
    },
    {
      title: 'Количество отработанных смен',
      dataIndex: 'numberOfShiftsWorked',
      key: 'numberOfShiftsWorked',
      sorter: (a, b) => a.numberOfShiftsWorked - b.numberOfShiftsWorked,
    },
    {
      title: 'Выплачено',
      dataIndex: 'sum',
      key: 'sum',
      sorter: (a, b) => a.sum - b.sum,
      render: currencyRender,
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector<TablePayment>(columnsEmployee, 'employee-columns');

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Hr' },
    { action: 'create', subject: 'Hr' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xl sm:text-3xl font-normal text-text01 ${screens.md ? '' : 'ml-12'}`}
          >
            {t('routes.empAdv')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className={`btn-primary ${screens.md ? '' : 'ant-btn-icon-only'}`}
            onClick={() => navigate('/hr/employee/advance/creation')}
          >
            {screens.md && t('routes.create')}
          </Button>
        )}
      </div>

      <div className="mt-5">
        <EmployeeSalaryFilter count={totalCount} workers={workers} />

        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          rowKey={record =>
            `${record.name}-${record.billingMonth}-${record.paymentDate}`
          }
          dataSource={payments}
          columns={visibleColumns}
          loading={paymentsLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} сотрудников`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
        />
      </div>
    </div>
  );
};

export default EmployeeAdvance;
