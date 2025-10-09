import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Table, Button, Grid } from 'antd';
import { ColumnsType } from 'antd/es/table';
import EmployeeSalaryFilter from '@/components/ui/Filter/EmployeeSalaryFilter';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import {
  getPayments,
  getPositions,
  getWorkers,
  PaymentsResponse,
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

type TOption = {
  id: number;
  name: string;
};

type TablePayment = PaymentsResponse & {
  id: number;
  hrPosition?: string;
};

const SalaryCalculation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const userPermissions = usePermissions();

  const screens = Grid.useBreakpoint();

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

  const { data: paymentsData, isLoading } = useSWR(
    [
      'get-payments',
      startPaymentDate,
      endPaymentDate,
      workerId,
      currentPage,
      pageSize,
    ],
    () =>
      getPayments({
        startPaymentDate: startPaymentDate,
        endPaymentDate: endPaymentDate,
        hrWorkerId: workerId,
        page: currentPage,
        size: pageSize,
      }).finally(() => setIsInitialLoading(false)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: workersData } = useSWR(['get-workers'], () => getWorkers({}), {
    revalidateOnFocus: false,
  });

  const { data: positionData } = useSWR(
    ['get-positions'],
    () => getPositions(),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const workers =
    workersData?.map(worker => ({
      name: worker.props.name,
      value: worker.props.id,
    })) || [];

  const adaptedPositionData = positionData?.map(item => ({
    id: item.props.id,
    name: item.props.name,
  }));

  const positionsMap = useMemo(() => {
    const map = new Map<number, string>();
    adaptedPositionData?.forEach((pos: TOption) => {
      map.set(pos.id, pos.name);
    });
    return map;
  }, [positionData]);

  const payments = useMemo<TablePayment[]>(() => {
    return (
      paymentsData?.map(pay => ({
        ...pay,
        id: pay.hrWorkerId,
        hrPosition: positionsMap.get(pay.hrPositionId) ?? undefined,
      })) || []
    );
  }, [paymentsData, positionsMap]);

  const totalCount = paymentsData?.length || 0;

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const columnsSalaryCalculation: ColumnsType<TablePayment> = [
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
      title: 'Месяц расчёта',
      dataIndex: 'billingMonth',
      key: 'billingMonth',
      render: (_, record) =>
        record.billingMonth ? dayjs(record.billingMonth).format('MM.YYYY') : '',
    },
    {
      title: 'Дата выдачи',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
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
    },
    {
      title: 'Количество отработанных смен',
      dataIndex: 'numberOfShiftsWorked',
      key: 'numberOfShiftsWorked',
      sorter: (a, b) => a.numberOfShiftsWorked - b.numberOfShiftsWorked,
    },
    {
      title: 'Выплачено аванс',
      dataIndex: 'prepaymentSum',
      key: 'prepaymentSum',
      render: currencyRender,
      sorter: (a, b) => a.prepaymentSum - b.prepaymentSum,
    },
    {
      title: 'Основная часть ЗП',
      dataIndex: 'paymentSum',
      key: 'paymentSum',
      sorter: (a, b) => a.paymentSum - b.paymentSum,
      render: currencyRender,
    },
    {
      title: 'Премия',
      dataIndex: 'prize',
      key: 'prize',
      sorter: (a, b) => a.prize - b.prize,
      render: currencyRender,
    },
    {
      title: 'Штраф',
      dataIndex: 'fine',
      key: 'fine',
      sorter: (a, b) => a.fine - b.fine,
      render: currencyRender,
    },
    {
      title: 'Безналичная выплата',
      dataIndex: 'virtualSum',
      key: 'virtualSum',
      render: currencyRender,
    },
    {
      title: 'К выплате',
      dataIndex: 'totalPayment',
      key: 'totalPayment',
      sorter: (a, b) => a.totalPayment - b.totalPayment,
      render: currencyRender,
    },
    {
      title: 'К выплате итог',
      dataIndex: 'totalPaymentFinal',
      key: 'totalPaymentFinal',
      sorter: (a, b) => a.totalPaymentFinal - b.totalPaymentFinal,
      render: currencyRender,
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector<TablePayment>(
      columnsSalaryCalculation,
      'salary-calc-columns'
    );

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
            {t('routes.salary')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className={`btn-primary ${screens.md ? '' : 'ant-btn-icon-only'}`}
            onClick={() => navigate('/hr/salary/creation')}
          >
            {screens.md && t('routes.calc')}
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
          loading={isLoading || isInitialLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
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

export default SalaryCalculation;
