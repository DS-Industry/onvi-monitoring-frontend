import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import {
  Table,
  Button,
  Grid,
  Form,
  DatePicker,
  Input,
  Typography,
  Modal,
} from 'antd';
import { TableProps } from 'antd/es/table';
import EmployeeSalaryFilter from '@/components/ui/Filter/EmployeeSalaryFilter';
import {
  deletePrepayments,
  getPositions,
  getPrepayments,
  getPrepaymentsCount,
  getWorkers,
  PrepaymentResponse,
  PrePaymentUpdateRequest,
  updatePrepayment,
} from '@/services/api/hr';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from '@/utils/constants';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';
import { updateSearchParams } from '@/utils/searchParamsUtils';

import { CloseOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { Can } from '@/permissions/Can';
import { useToast } from '@/components/context/useContext';
import useSWRMutation from 'swr/mutation';

type TablePayment = PrepaymentResponse & {
  hrPosition?: string;
};

type DataType = PrePaymentUpdateRequest &
  TablePayment & {
    key: string;
    id: number;
  };

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  inputType: 'number' | 'text' | 'date';
  record: DataType;
  index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  inputType,
  children,
  ...restProps
}) => {
  const form = Form.useFormInstance();

  const inputNode =
    inputType === 'date' ? (
      <DatePicker
        style={{ width: '150px' }}
        value={form.getFieldValue(dataIndex)}
        onChange={date => form.setFieldValue(dataIndex, date)}
        showTime={true}
      />
    ) : inputType === 'number' ? (
      <Input
        type="number"
        className="w-32"
        suffix={<div className="text-text02">₽</div>}
        value={form.getFieldValue(dataIndex)}
        onChange={e =>
          form.setFieldValue(dataIndex, parseFloat(e.target.value))
        }
      />
    ) : (
      <Input
        value={form.getFieldValue(dataIndex)}
        onChange={e => form.setFieldValue(dataIndex, e.target.value)}
      />
    );

  return (
    <td
      {...restProps}
      style={{ paddingLeft: '9px', paddingTop: '10px', paddingBottom: '10px' }}
    >
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EmployeeAdvance: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const userPermissions = usePermissions();
  const user = useUser();
  const [data, setData] = useState<DataType[]>([]);
  const [editingKey, setEditingKey] = useState('');
  const { showToast } = useToast();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const screens = Grid.useBreakpoint();

  const { data: positionData } = useSWR(
    user.organizationId ? [`get-positions`, user.organizationId] : null,
    () =>
      getPositions({
        organizationId: user.organizationId,
      }),
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

  const { data: paymentData, isLoading: paymentsLoading } = useSWR(
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

  useEffect(() => {
    if (paymentData) {
      setData(
        (paymentData || []).map(item => ({
          ...item,
          prepaymentId: item.id,
          key: `${item.id}`,
          id: item.id,
        }))
      );
    }
  }, [paymentData]);

  const { trigger: updatePayment, isMutating: updatingPrePayment } =
    useSWRMutation(
      ['update-prepayment'],
      async (
        _,
        {
          arg,
        }: {
          arg: PrePaymentUpdateRequest;
        }
      ) => {
        return updatePrepayment(arg);
      }
    );

  const payments =
    data?.map(pay => ({
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

  const isEditing = (record: DataType) => record.key === editingKey;

  const edit = (record: Partial<DataType> & { key: React.Key }) => {
    form.setFieldsValue({
      ...record,
      id: record.id,
      prepaymentId: record.prepaymentId, // ✅ include it
      payoutTimestamp: record.payoutTimestamp
        ? dayjs(record.payoutTimestamp)
        : null,
    });
    setEditingKey(record.key);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as DataType;
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const updatedItem = { ...item, ...row };
        const apiPayload = {
          prepaymentId: item.prepaymentId || item.id || row.id, // ✅ ensure ID is sent
          sum: updatedItem.sum,
          payoutTimestamp: dayjs(updatedItem.payoutTimestamp).toDate(),
        };

        const result = await updatePayment(apiPayload);
        if (result) {
          mutate([
            'get-payments',
            startPaymentDate,
            endPaymentDate,
            workerId,
            currentPage,
            pageSize,
          ]);
          mutate([
            'get-payments-count',
            startPaymentDate,
            endPaymentDate,
            workerId,
          ]);
          newData.splice(index, 1, updatedItem);
          setData(newData);
          setEditingKey('');
          showToast(t('success.recordUpdated'), 'success');
        }
      }
    } catch (error) {
      console.log('Update Failed:', error);
      showToast(t('errors.other.failedToUpdateRecord'), 'error');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const handleDeleteRow = async () => {
    Modal.confirm({
      title: t('common.title'),
      content: t('common.content'),
      okText: t('common.okText'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          const result = await mutate(
            [`delete-manager-data`],
            () =>
              deletePrepayments({
                ids: selectedRowKeys.map(key => Number(key)),
              }),
            false
          );

          if (result) {
            mutate([
              'get-payments',
              startPaymentDate,
              endPaymentDate,
              workerId,
              currentPage,
              pageSize,
            ]);
            mutate([
              'get-payments-count',
              startPaymentDate,
              endPaymentDate,
              workerId,
            ]);
            setSelectedRowKeys([]);
            if (selectedRowKeys.includes(editingKey)) {
              setEditingKey('');
            }
          }
        } catch (error) {
          console.error('Error deleting nomenclature:', error);
        }
      },
      onCancel() {
        showToast(t('info.deleteCancelled'), 'info');
      },
    });
  };

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columnsEmployee = [
    {
      title: 'ФИО',
      dataIndex: 'name',
      key: 'name',
      editable: false,
    },
    {
      title: 'Должность',
      dataIndex: 'hrPosition',
      key: 'hrPosition',
      render: (value: string) => value || '-',
      editable: false,
    },
    {
      title: 'Расчетный месяц',
      dataIndex: 'billingMonth',
      key: 'billingMonth',
      render: (_: unknown, record: DataType) =>
        record.billingMonth ? dayjs(record.billingMonth).format('MM.YYYY') : '',
      editable: false,
    },
    {
      title: 'Дата выдачи',
      dataIndex: 'payoutTimestamp',
      key: 'payoutTimestamp',
      render: dateRender,
      editable: true,
    },
    {
      title: 'Посменное начисление',
      dataIndex: 'dailySalary',
      key: 'dailySalary',
      render: currencyRender,
      editable: false,
    },
    {
      title: t('validation.bonusPayout'),
      dataIndex: 'bonusPayout',
      key: 'bonusPayout',
      render: currencyRender,
      editable: false,
    },
    {
      title: 'Количество отработанных смен',
      dataIndex: 'numberOfShiftsWorked',
      key: 'numberOfShiftsWorked',
      editable: false,
    },
    {
      title: 'Выплачено',
      dataIndex: 'sum',
      key: 'sum',
      sorter: (a: DataType, b: DataType) => a.sum - b.sum,
      render: currencyRender,
      editable: true,
    },
    {
      title: 'Операции',
      dataIndex: 'operation',
      width: '15%',
      render: (_: unknown, record: DataType) => {
        const editable = isEditing(record);
        return (
          <Can
            requiredPermissions={[
              { action: 'manage', subject: 'Hr' },
              { action: 'delete', subject: 'Hr' },
            ]}
            userPermissions={userPermissions}
          >
            {allowed =>
              allowed && (
                <div>
                  {editable ? (
                    <span className="flex space-x-4">
                      <Button onClick={cancel}>
                        {t('organizations.cancel')}
                      </Button>
                      <Button
                        onClick={() => save(record.key)}
                        type="primary"
                        loading={updatingPrePayment}
                      >
                        {t('routes.save')}
                      </Button>
                    </span>
                  ) : (
                    <Typography.Link
                      disabled={editingKey !== ''}
                      onClick={() => edit(record)}
                    >
                      {t('actions.edit')}
                    </Typography.Link>
                  )}
                </div>
              )
            }
          </Can>
        );
      },
    },
  ];

  const mergedColumns: TableProps<DataType>['columns'] = columnsEmployee.map(
    col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: DataType) => ({
          record,
          inputType:
            col.dataIndex === 'payoutTimestamp'
              ? 'date'
              : col.dataIndex === 'sum'
                ? 'number'
                : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    }
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
        <Form form={form} component={false}>
          <Table<DataType>
            dataSource={payments}
            columns={mergedColumns}
            loading={paymentsLoading}
            rowSelection={rowSelection}
            scroll={{ x: 'max-content' }}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
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
        </Form>
        {selectedRowKeys.length > 0 && (
          <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-1/2 right-2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
            <div className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg flex items-center justify-between sm:justify-center gap-2 sm:gap-4 max-w-full sm:max-w-none">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setSelectedRowKeys([])}
                  className="text-white hover:text-gray-200 p-0 h-auto flex-shrink-0"
                />
                <span className="text-xs sm:text-sm font-medium truncate">
                  {t('techTasks.selectedTasks', {
                    count: selectedRowKeys.length,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-px h-4 bg-white hidden sm:block"></div>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteRow}
                  className="text-white hover:text-gray-200 p-0 h-auto flex-shrink-0"
                >
                  <span className="hidden sm:inline">
                    {t('techTasks.delete')}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAdvance;
