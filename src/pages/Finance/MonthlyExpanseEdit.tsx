import React, { useMemo, useState } from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { getPoses } from '@/services/api/equipment';
import {
  getManagerPeriodById,
  returnManagerPaperPeriod,
  sendManagerPaperPeriod,
} from '@/services/api/finance';
import TableSkeleton from '@/components/ui/Table/TableSkeleton';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import { useToast } from '@/components/context/useContext';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';
import {
  CheckOutlined,
  UndoOutlined,
} from '@ant-design/icons';

enum ManagerPaperGroup {
  RENT = 'RENT',
  REVENUE = 'REVENUE',
  WAGES = 'WAGES',
  INVESTMENT_DEVIDENTS = 'INVESTMENT_DEVIDENTS',
  UTILITY_BILLS = 'UTILITY_BILLS',
  TAXES = 'TAXES',
  ACCOUNTABLE_FUNDS = 'ACCOUNTABLE_FUNDS',
  REPRESENTATIVE_EXPENSES = 'REPRESENTATIVE_EXPENSES',
  SALE_EQUIPMENT = 'SALE_EQUIPMENT',
  MANUFACTURE = 'MANUFACTURE',
  OTHER = 'OTHER',
  SUPPLIES = 'SUPPLIES',
  P_C = 'P_C',
  WAREHOUSE = 'WAREHOUSE',
  CONSTRUCTION = 'CONSTRUCTION',
  MAINTENANCE_REPAIR = 'MAINTENANCE_REPAIR',
  TRANSPORTATION_COSTS = 'TRANSPORTATION_COSTS',
}

type ExpenseItem = {
  id: number;
  deviceId: number;
  group: string;
  posName: string;
  paperTypeId: number;
  paperTypeName: string;
  paperTypeType: string;
  eventDate: Date;
  sum: number;
  imageProductReceipt?: string;
};

type PeriodItem = {
  id: number;
  deviceId: number;
  title: string;
  status: string;
  startPeriod: Date;
  endPeriod: Date;
  sumStartPeriod: number;
  sumEndPeriod: number;
  shortage: number;
};

const MonthlyExpanseEdit: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const userPermissions = usePermissions();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const placementId = searchParams.get('city');
  const city = placementId ? Number(placementId) : undefined;

  const { data: posData } = useSWR(
    [`get-pos`, city],
    () => getPoses({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const poses = useMemo(
    () =>
      (posData || [])
        .map(item => ({ name: item.name, value: item.id }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [posData]
  );

  const {
    data: managerPeriodData,
    isLoading: periodsLoading,
    isValidating: periodsValidating,
  } = useSWR(
    location.state.ownerId
      ? [`get-manager-period`, location.state.ownerId]
      : null,
    () => getManagerPeriodById(location.state.ownerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const getStatusTag = (statusKey: string) => {
    console.log(statusKey);
    
    const statusText = t(`tables.${statusKey}`);

    if (
      statusKey === 'ACTIVE' ||
      statusKey === 'SENT' ||
      statusKey === 'In Progress' ||
      statusKey === 'PROGRESS' ||
      statusKey === 'RECEIPT'
    ) {
      return <Tag color="green">{statusText}</Tag>;
    }
    if (
      statusKey === 'OVERDUE' ||
      statusKey === 'Done' ||
      statusKey === 'FINISHED' ||
      statusKey === 'PAUSE' ||
      statusKey === 'DONE' ||
      statusKey === 'EXPENDITURE'
    ) {
      return <Tag color="red">{statusText}</Tag>;
    }
    if (
      statusKey === 'SAVED' ||
      statusKey === 'VERIFICATE' ||
      statusKey === 'SAVE'
    ) {
      return <Tag color="orange">{statusText}</Tag>;
    }
    return <Tag color="default">{statusText}</Tag>;
  };

  const groups = useMemo(
    () => [
      { value: ManagerPaperGroup.RENT, name: t('finance.RENT') },
      { value: ManagerPaperGroup.REVENUE, name: t('finance.REVENUE') },
      { value: ManagerPaperGroup.WAGES, name: t('finance.WAGES') },
      {
        value: ManagerPaperGroup.INVESTMENT_DEVIDENTS,
        name: t('finance.INVESTMENT_DEVIDENTS'),
      },
      {
        value: ManagerPaperGroup.UTILITY_BILLS,
        name: t('finance.UTILITY_BILLS'),
      },
      { value: ManagerPaperGroup.TAXES, name: t('finance.TAXES') },
      {
        value: ManagerPaperGroup.ACCOUNTABLE_FUNDS,
        name: t('finance.ACCOUNTABLE_FUNDS'),
      },
      {
        value: ManagerPaperGroup.REPRESENTATIVE_EXPENSES,
        name: t('finance.REPRESENTATIVE_EXPENSES'),
      },
      {
        value: ManagerPaperGroup.SALE_EQUIPMENT,
        name: t('finance.SALE_EQUIPMENT'),
      },
      { value: ManagerPaperGroup.MANUFACTURE, name: t('finance.MANUFACTURE') },
      { value: ManagerPaperGroup.OTHER, name: t('finance.OTHER') },
      { value: ManagerPaperGroup.SUPPLIES, name: t('finance.SUPPLIES') },
      { value: ManagerPaperGroup.P_C, name: t('finance.P_C') },
      { value: ManagerPaperGroup.WAREHOUSE, name: t('finance.WAREHOUSE') },
      {
        value: ManagerPaperGroup.CONSTRUCTION,
        name: t('finance.CONSTRUCTION'),
      },
      {
        value: ManagerPaperGroup.MAINTENANCE_REPAIR,
        name: t('finance.MAINTENANCE_REPAIR'),
      },
      {
        value: ManagerPaperGroup.TRANSPORTATION_COSTS,
        name: t('finance.TRANSPORTATION_COSTS'),
      },
    ],
    [t]
  );

  const { periodData, expenseData } = useMemo(() => {
    if (!managerPeriodData)
      return { periodData: [], expenseData: [] };

    const period: PeriodItem[] = [
      {
        id: managerPeriodData.id,
        deviceId: managerPeriodData.id,
        title: managerPeriodData.status,
        status: managerPeriodData.status,
        startPeriod: managerPeriodData.startPeriod,
        endPeriod: managerPeriodData.endPeriod,
        sumStartPeriod: managerPeriodData.sumStartPeriod,
        sumEndPeriod: managerPeriodData.sumEndPeriod,
        shortage: managerPeriodData.shortage,
      },
    ];

    const expenses: ExpenseItem[] = managerPeriodData.managerPaper?.map(item => ({
      id: item.paperTypeId,
      deviceId: managerPeriodData.id,
      group: groups.find(g => g.value === item.group)?.name || item.group,
      posName: poses.find(pos => pos.value === item.posId)?.name || 'Не указано',
      paperTypeId: item.paperTypeId,
      paperTypeName: item.paperTypeName,
      paperTypeType: t(`finance.${item.paperTypeType}`),
      eventDate: new Date(item.eventDate),
      sum: item.sum,
      imageProductReceipt: item.imageProductReceipt || undefined,
    })) || [];

    return {
      periodData: period,
      expenseData: expenses,
    };
  }, [groups, managerPeriodData, poses, t]);

  const [isLoading, setIsLoading] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const handleSendPeriod = async () => {
    try {
      setIsLoading(true);
      await mutate(
        [`send-manager-period`],
        () => sendManagerPaperPeriod(location.state.ownerId),
        false
      );
      navigate(-1);
    } catch (error) {
      showToast(t('errors.other.errorDeletingNomenclature'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnPeriod = async () => {
    try {
      setIsReturning(true);
      await mutate(
        [`return-manager-period`],
        () => returnManagerPaperPeriod(location.state.ownerId),
        false
      );
      navigate(-1);
    } catch (error) {
      showToast(t('errors.other.errorDeletingNomenclature'), 'error');
    } finally {
      setIsReturning(false);
    }
  };

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const periodColumns: ColumnsType<PeriodItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: t('Статус'),
      dataIndex: 'status',
      key: 'status',
      render: (statusKey: string) => getStatusTag(statusKey)
    }, {
      title: t('Начало периода'),
      dataIndex: 'startPeriod',
      key: 'startPeriod',
      render: dateRender
    },
    {
      title: t('Конец периода'),
      dataIndex: 'endPeriod',
      key: 'endPeriod',
      render: dateRender
    },
    {
      title: t('Сумма на начало периода'),
      dataIndex: 'sumStartPeriod',
      key: 'sumStartPeriod',
      render: currencyRender
    },
    {
      title: t('Сумма на конец периода'),
      dataIndex: 'sumEndPeriod',
      key: 'sumEndPeriod',
      render: currencyRender
    },
    {
      title: t('Недостача'),
      dataIndex: 'shortage',
      key: 'shortage',
      render: currencyRender
    },
  ];

  const expenseColumns: ColumnsType<ExpenseItem> = [
    {
      title: t('Группа'),
      dataIndex: 'group',
      key: 'group'
    },
    {
      title: t('Автомойка/филиал'),
      dataIndex: 'posName',
      key: 'posName'
    },
    {
      title: t('Статья'),
      dataIndex: 'paperTypeName',
      key: 'paperTypeName'
    },
    {
      title: t('Тип статьи'),
      dataIndex: 'paperTypeType',
      key: 'paperTypeType'
    },
    {
      title: t('Дата'),
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: dateRender
    },
    {
      title: t('Сумма'),
      dataIndex: 'sum',
      key: 'sum',
      render: currencyRender
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.reportFor')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>

      <div className="mt-8">
        {periodsLoading || periodsValidating ? (
          <TableSkeleton columnCount={periodColumns.length} />
        ) : (
          <div className="space-y-4">
            <Space>
              <Can
                requiredPermissions={[
                  { action: 'manage', subject: 'ManagerPaper' },
                  { action: 'create', subject: 'ManagerPaper' },
                ]}
                userPermissions={userPermissions}
              >
                {allowed =>
                  allowed &&
                  location.state.status === 'SAVE' && (
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={handleSendPeriod}
                      loading={isLoading}
                    >
                      {t('finance.send')}
                    </Button>
                  )
                }
              </Can>
              <Can
                requiredPermissions={[
                  { action: 'manage', subject: 'ManagerPaper' },
                ]}
                userPermissions={userPermissions}
              >
                {allowed =>
                  allowed &&
                  location.state.status === 'SENT' && (
                    <Button
                      type="primary"
                      icon={<UndoOutlined />}
                      onClick={handleReturnPeriod}
                      loading={isReturning}
                    >
                      {t('finance.returns')}
                    </Button>
                  )
                }
              </Can>
            </Space>

            <Table
              rowKey="id"
              dataSource={periodData}
              columns={periodColumns}
              expandable={{
                expandedRowRender: record => {
                  const expensesForRecord = expenseData.filter(
                    item => item.deviceId === record.id
                  );
                  return (
                    <Table
                      rowKey="id"
                      dataSource={expensesForRecord}
                      columns={expenseColumns}
                      pagination={false}
                    />
                  );
                },
                rowExpandable: record => {
                  const hasExpenses = expenseData.some(
                    item => item.deviceId === record.id
                  );
                  return hasExpenses;
                }
              }}
              pagination={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyExpanseEdit;
