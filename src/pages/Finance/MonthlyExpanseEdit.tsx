import React, { useMemo, useState } from 'react';
import { Table, Button, Space, Descriptions, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { getPoses, getWorkers } from '@/services/api/equipment';
import {
  getManagerPeriodById,
  ManagerReportPeriodStatus,
  returnManagerPaperPeriod,
  sendManagerPaperPeriod,
  deleteManagerPaperPeriod,
} from '@/services/api/finance';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import { useToast } from '@/components/context/useContext';
import {
  formatNumber,
  getCurrencyRender,
  getDateRender,
  getStatusTagRender,
} from '@/utils/tableUnits';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  UndoOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { groups } from '@/utils/constants';
import TableUtils from '@/utils/TableUtils.tsx';
import { ColumnsType } from 'antd/es/table';
import { Key } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';

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

  const user = useUser();

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

  const workerMap = workerData
      ? new Map(workerData.map(work => [work.id, `${work.name} ${work.surname}`]))
      : new Map();

  const { data: posData } = useSWR(
    [`get-pos`, city],
    () => getPoses({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
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
    ownerId ? [`get-manager-period`, ownerId] : null,
    () => getManagerPeriodById(ownerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { periodData, expenseData } = useMemo(() => {
    if (!managerPeriodData) return { periodData: [], expenseData: [] };

    const period = [
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

    const expenses =
      managerPeriodData.managerPaper?.map(item => ({
        id: item.paperTypeId,
        deviceId: managerPeriodData.id,
        group: groups.find(g => g.value === item.group)?.name || item.group,
        posName:
          poses.find(pos => pos.value === item.posId)?.name || 'Не указано',
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showData, setShowData] = useState(true);

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
      showToast(t('errors.other.errorDeletingPeriod'), 'error');
    } finally {
      setIsReturning(false);
    }
  };

  const handleDeletePeriod = async () => {
    try {
      setIsDeleting(true);
      await mutate(
        [`delete-manager-period`],
        () => deleteManagerPaperPeriod(ownerId),
        false
      );
      navigate(-1);
    } catch (error) {
      showToast(t('errors.other.errorDeletingPeriod'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const statusOptions: { name: string; value: ManagerReportPeriodStatus }[] = [
    { name: t('tables.SAVED'), value: ManagerReportPeriodStatus.SAVE },
    { name: t('tables.SENT'), value: ManagerReportPeriodStatus.SENT },
  ];

  const periodColumns = [
    { title: t('table.columns.id'), dataIndex: 'id', key: 'id' },
    {
      title: t('table.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const statusOption = statusOptions.find(
          option => option.value === text
        );
        return statusOption ? tagRender(statusOption.name) : text;
      },
    },
    {
      title: t('finance.begin'),
      dataIndex: 'startPeriod',
      key: 'startPeriod',
      render: dateRender,
    },
    {
      title: t('finance.end'),
      dataIndex: 'endPeriod',
      key: 'endPeriod',
      render: dateRender,
    },
    {
      title: t('table.headers.amountBegin'),
      dataIndex: 'sumStartPeriod',
      key: 'sumStartPeriod',
      render: currencyRender,
    },
    {
      title: t('table.headers.amountEnd'),
      dataIndex: 'sumEndPeriod',
      key: 'sumEndPeriod',
      render: currencyRender,
    },
    {
      title: t('finance.short'),
      dataIndex: 'shortage',
      key: 'shortage',
      render: currencyRender,
    },
  ];

  const expenseColumns: ColumnsType<ExpenseItem> = [
    {
      title: t('finance.group'),
      dataIndex: 'group',
      key: 'group',
      filters: groups.map(g => ({ text: g.name, value: g.name })),
      onFilter: (value: boolean | Key, record: ExpenseItem) =>
        record.group === value,
    },
    {
      title: t('marketing.carWashBranch'),
      dataIndex: 'posName',
      key: 'posName',
      filters: poses.map(p => ({ text: p.name, value: p.name })),
      onFilter: (value: boolean | Key, record: ExpenseItem) =>
        record.posName === value,
    },
    {
      title: t('finance.article'),
      dataIndex: 'paperTypeName',
      key: 'paperTypeName',
    },
    {
      title: t('finance.articleType'),
      dataIndex: 'paperTypeType',
      key: 'paperTypeType',
      render: tagRender,
      filters: [
        { name: t('finance.RECEIPT') },
        { name: t('finance.EXPENDITURE') },
      ].map(p => ({ text: p.name, value: p.name })),
      onFilter: (value: boolean | Key, record: ExpenseItem) =>
        record.paperTypeType === value,
    },
    {
      title: t('finance.dat'),
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: dateRender,
    },
    {
      title: t('marketing.amount'),
      dataIndex: 'sum',
      key: 'sum',
      render: (value: string, record: { paperTypeType: string }) => {
        const formattedCurrency = TableUtils.createCurrencyFormat(
          formatNumber(Number(value))
        );
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
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.reportFor')}
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        {managerPeriodData && Object.keys(managerPeriodData).length > 0 && (
          <Button
            icon={showData ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setShowData(!showData)}
          >
            {t('finance.add')}
          </Button>
        )}
      </div>
      {showData &&
        managerPeriodData &&
        Object.keys(managerPeriodData).length > 0 && (
          <>
            <Descriptions
              title={''}
              column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
              labelStyle={{ fontWeight: 500 }}
              contentStyle={{
                textAlign: 'right',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              <Descriptions.Item label={t('table.columns.user')}>
                {workerMap.get(managerPeriodData.userId)}
              </Descriptions.Item>
              <Descriptions.Item label={t('table.columns.periodStart')}>
                {`${dayjs(managerPeriodData.startPeriod).format(
                  'DD.MM.YYYY HH:mm:ss'
                )}`}
              </Descriptions.Item>
              <Descriptions.Item label={t('table.columns.periodEnd')}>
                {`${dayjs(managerPeriodData.endPeriod).format(
                  'DD.MM.YYYY HH:mm:ss'
                )}`}
              </Descriptions.Item>
              <Descriptions.Item label={t('table.columns.createdAt')}>
                {`${dayjs(managerPeriodData.createdAt).format(
                  'DD.MM.YYYY HH:mm:ss'
                )}`}
              </Descriptions.Item>
              <Descriptions.Item label={t('table.columns.updatedAt')}>
                {`${dayjs(managerPeriodData.updatedAt).format(
                  'DD.MM.YYYY HH:mm:ss'
                )}`}
              </Descriptions.Item>
              <Descriptions.Item label={t('table.columns.createdBy')}>
                {workerMap.get(managerPeriodData.createdById)}
              </Descriptions.Item>
              <Descriptions.Item label={t('table.columns.updatedBy')}>
                {workerMap.get(managerPeriodData.updatedById)}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
          </>
        )}
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
            <Can
              requiredPermissions={[
                { action: 'manage', subject: 'ManagerPaper' },
                { action: 'delete', subject: 'ManagerPaper' },
              ]}
              userPermissions={userPermissions}
            >
              {allowed =>
                allowed &&
                status === 'SAVE' && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeletePeriod}
                    loading={isDeleting}
                  >
                    {t('common.delete')}
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
                    summary={pageData => {
                      const totalSum = pageData.reduce(
                        (acc, item) => acc + (item.sum || 0),
                        0
                      );
                      return (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                              <strong>{t('finance.total')}</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} />
                            <Table.Summary.Cell index={2} />
                            <Table.Summary.Cell index={3} />
                            <Table.Summary.Cell index={4} />
                            <Table.Summary.Cell index={5}>
                              <strong>{`${totalSum} ₽`}</strong>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      );
                    }}
                  />
                );
              },
              rowExpandable: record => {
                const hasExpenses = expenseData.some(
                  item => item.deviceId === record.id
                );
                return hasExpenses;
              },
            }}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpanseEdit;
