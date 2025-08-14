import React, { useMemo, useState } from 'react';
import { Table, Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { getPoses } from '@/services/api/equipment';
import {
  getManagerPeriodById,
  returnManagerPaperPeriod,
  sendManagerPaperPeriod,
} from '@/services/api/finance';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import { useToast } from '@/components/context/useContext';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { formatNumber, getCurrencyRender, getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import {
  CheckOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { ManagerReportPeriodStatus } from './MonthlyExpanse';
import { groups } from '@/utils/constants';
import TableUtils from '@/utils/TableUtils.tsx';

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
  const { t } = useTranslation();
  const userPermissions = usePermissions();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const city = Number(searchParams.get('city')) || undefined;

  const ownerId = Number(searchParams.get('ownerId'));
  const status = searchParams.get('status') as ManagerReportPeriodStatus;

  const tagRender = getStatusTagRender(t);

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
    ownerId
      ? [`get-manager-period`, ownerId]
      : null,
    () => getManagerPeriodById(ownerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
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
        () => sendManagerPaperPeriod(ownerId),
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
        () => returnManagerPaperPeriod(ownerId),
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

  const statusOptions: { name: string; value: ManagerReportPeriodStatus }[] = [
    { name: t('tables.SAVED'), value: ManagerReportPeriodStatus.SAVE },
    { name: t('tables.SENT'), value: ManagerReportPeriodStatus.SENT },
  ];

  const periodColumns: ColumnsType<PeriodItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: t('Статус'),
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const statusOption = statusOptions.find(
          option => option.value === text
        );
        return statusOption ? tagRender(statusOption.name) : text;
      },
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
      key: 'paperTypeType',
      render: tagRender
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
      render: (value, record) => {
        const formattedCurrency = TableUtils.createCurrencyFormat(formatNumber(Number(value)));
        if (record.paperTypeType === t('finance.RECEIPT')) {
          return <div className="text-successFill">+{formattedCurrency}</div>;
        } else if (record.paperTypeType === t('finance.EXPENDITURE')) {
          return <div className="text-errorFill">-{formattedCurrency}</div>;
        }
        return formattedCurrency;
      },
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
                status === 'SAVE' && (
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
                status === 'SENT' && (
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
            loading={periodsLoading || periodsValidating}
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
      </div>
    </div>
  );
};

export default MonthlyExpanseEdit;
