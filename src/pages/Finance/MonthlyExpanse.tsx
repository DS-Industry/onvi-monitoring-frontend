import DropdownInput from '@/components/ui/Input/DropdownInput';
import Input from '@/components/ui/Input/Input';
import useFormHook from '@/hooks/useFormHook';
import { getWorkers } from '@/services/api/equipment';
import { CloseOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@/hooks/useUserStore';
import DateInput from '@/components/ui/Input/DateInput';
import {
  createManagerPaperPeriod,
  deleteManagerPaperPeriod,
  getAllManagerPeriods,
  ManagerPeriods,
  ManagerReportPeriodStatus,
  updateManagerPaperPeriod,
} from '@/services/api/finance';

import TableUtils from '@/utils/TableUtils.tsx';
import Table from 'antd/es/table';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import Dropdown from 'antd/es/dropdown';
import Modal from 'antd/es/modal';
import InputNumber from 'antd/es/input-number';
import Form from 'antd/es/form';
import AntInput from 'antd/es/input';
import DatePicker from 'antd/es/date-picker';
import { usePermissions } from '@/hooks/useAuthStore';
import { useToast } from '@/components/context/useContext';
import { Drawer, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import hasPermission from '@/permissions/hasPermission';
import { getStatusTagRender } from '@/utils/tableUnits';

const { Option } = Select;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: 'number' | 'text' | 'select' | 'period';
  record: ManagerPeriods;
  index: number;
  selectOptions?: Array<{ name: string; value: string | number }>;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  inputType,
  selectOptions,
  children,
  ...restProps
}) => {
  const getInputNode = () => {
    switch (inputType) {
      case 'number':
        return <InputNumber style={{ width: '100%' }} />;
      case 'select':
        return (
          <Select style={{ width: '100%' }}>
            {selectOptions?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.name}
              </Option>
            ))}
          </Select>
        );
      case 'period':
        return null;
      default:
        return <AntInput />;
    }
  };

  return (
    <td {...restProps}>
      {editing ? (
        inputType === 'period' ? (
          <Space>
            <Form.Item
              name="startPeriod"
              style={{ margin: 0 }}
              rules={[{ required: true, message: `Введите дату начала!` }]}
            >
              <DatePicker
                format="DD.MM.YYYY"
                style={{ width: 130 }}
                placeholder="Start Date"
              />
            </Form.Item>
            <Form.Item
              name="endPeriod"
              style={{ margin: 0 }}
              rules={[{ required: true, message: `Введите дату окончания!` }]}
            >
              <DatePicker
                format="DD.MM.YYYY"
                style={{ width: 130 }}
                placeholder="End Date"
              />
            </Form.Item>
          </Space>
        ) : (
          <Form.Item name={dataIndex} style={{ margin: 0 }}>
            {getInputNode()}
          </Form.Item>
        )
      ) : (
        children
      )}
    </td>
  );
};

const MonthlyExpanse: React.FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateStartParam = searchParams.get('dateStart')
    ? dayjs(searchParams.get('dateStart')).toDate()
    : dayjs().startOf('month').toDate();
  const dateEndParam = searchParams.get('dateEnd')
    ? dayjs(searchParams.get('dateEnd')).toDate()
    : dayjs().endOf('month').toDate();
  const userIdParam = Number(searchParams.get('userId'));
  const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
  const [loadingManagerPaper, setLoadingManagerPaper] = useState(false);

  const userPermissions = usePermissions();
  const { showToast } = useToast();

  const formatNumber = (
    num: number,
    type: 'number' | 'double' = 'number'
  ): string => {
    if (num === null || num === undefined || isNaN(num)) return '-';

    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: type === 'double' ? 2 : 0,
      maximumFractionDigits: type === 'double' ? 2 : 0,
      useGrouping: true,
    }).format(num);
  };

  const filterParams = useMemo(
    () => ({
      startPeriod: dateStartParam,
      endPeriod: dateEndParam,
      userId: userIdParam,
      page: currentPage,
      size: pageSize,
    }),
    [dateStartParam, dateEndParam, userIdParam, currentPage, pageSize]
  );

  const swrKey = `get-all-manager-periods-${filterParams.startPeriod}-${filterParams.endPeriod}-${filterParams.userId}-${filterParams.page}-${filterParams.page}-${filterParams.size}`;

  const {
    data: managerPeriodData,
    isLoading: periodsLoading,
    mutate: mutateManagerPeriods,
  } = useSWR([swrKey, filterParams], () => getAllManagerPeriods(filterParams), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const managerPeriods = useMemo(
    () => managerPeriodData?.managerReportPeriods || [],
    [managerPeriodData]
  );

  const totalCount = useMemo(
    () => managerPeriodData?.totalCount || 0,
    [managerPeriodData]
  );

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const workers = useMemo(() => {
    return (
      workerData?.map(item => ({
        name: `${item.name} ${item.surname}`,
        value: item.id,
      })) || []
    );
  }, [workerData]);

  const defaultValues = {
    startPeriod: new Date(),
    endPeriod: new Date(),
    sumStartPeriod: 0,
    sumEndPeriod: 0,
    userId: 0,
  };

  const [editingKey, setEditingKey] = useState<string>('');

  const isEditing = (record: ManagerPeriods): boolean =>
    record.id.toString() === editingKey;

  const edit = (record: ManagerPeriods): void => {
    const [startStr, endStr] = record.period.split(' - ');
    const startDate = dayjs(startStr, 'DD.MM.YYYY');
    const endDate = dayjs(endStr, 'DD.MM.YYYY');

    form.setFieldsValue({
      ...record,
      startPeriod: startDate,
      endPeriod: endDate,
    });
    setEditingKey(record.id.toString());
  };

  const cancel = (): void => {
    setEditingKey('');
    form.resetFields();
  };

  const save = async (id: number): Promise<void> => {
    try {
      const row = await form.validateFields();

      await updateManagerPaperPeriod({
        managerReportPeriodId: id,
        sumStartPeriod: row.sumStartPeriod,
        sumEndPeriod: row.sumEndPeriod,
        startPeriod: row.startPeriod ? row.startPeriod.toDate() : undefined,
        endPeriod: row.endPeriod ? row.endPeriod.toDate() : undefined,
      });

      await mutateManagerPeriods();
      showToast(t('success.recordUpdated'), 'success');
      setEditingKey('');
      form.resetFields();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
      showToast(t('errors.other.pleaseCheckFormFields'), 'error');
    }
  };

  const getStatusTag = getStatusTagRender(t);

  const statusOptions: { name: string; value: ManagerReportPeriodStatus }[] = [
    { name: t('tables.SAVED'), value: ManagerReportPeriodStatus.SAVE },
    { name: t('tables.SENT'), value: ManagerReportPeriodStatus.SENT },
  ];

  const navigate = useNavigate();

  const handleDelete = (id: string | number) => {
    Modal.confirm({
      title: t('common.title'),
      content: t('common.content'),
      okText: t('common.okText'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          await deleteManagerPaperPeriod(Number(id));
          await mutateManagerPeriods();
          showToast(t('success.recordDeleted'), 'success');
        } catch (error) {
          showToast(t('errors.other.errorDeletingNomenclature'), 'error');
        }
      },
      onCancel() {
        showToast(t('info.deleteCancelled'), 'info');
      },
    });
  };

  const canEdit = hasPermission(userPermissions, [
    { action: 'manage', subject: 'ManagerPaper' },
    { action: 'create', subject: 'ManagerPaper' },
  ]);

  const canDelete = hasPermission(userPermissions, [
    { action: 'manage', subject: 'ManagerPaper' },
    { action: 'delete', subject: 'ManagerPaper' },
  ]);

  const columnsExpanse: ColumnsType<ManagerPeriods> = [
    {
      title: 'ID',
      dataIndex: 'id',
      onCell: (record: ManagerPeriods) => ({
        record,
        inputType: 'text',
        dataIndex: 'id',
        title: 'ID',
        editing: false,
      }),
    },
    {
      title: 'Период',
      dataIndex: 'period',
      render: (_: string, record: ManagerPeriods) => {
        const [startStr, endStr] = record.period.split(' - ');
        const start = dayjs(startStr, 'DD.MM.YYYY').format('DD.MM.YYYY');
        const end = dayjs(endStr, 'DD.MM.YYYY').format('DD.MM.YYYY');
        return (
          <div
            className="text-primary02 hover:text-primary02_Hover cursor-pointer font-semibold"
            onClick={() => {
              navigate({
                pathname: '/finance/report/period/edit',
                search: `?ownerId=${record.id}&status=${record.status}`,
              });
            }}
          >
            {`${start} - ${end}`}
          </div>
        );
      },
      onCell: (record: ManagerPeriods) => ({
        record,
        inputType: 'period',
        dataIndex: 'period',
        title: 'Период',
        editing: isEditing(record),
      }),
    },
    {
      title: 'Входная сумма',
      dataIndex: 'sumStartPeriod',
      render: (text: number, record: ManagerPeriods) => {
        if (!isEditing(record)) {
          return (
            <div className="text-text01">
              {TableUtils.createCurrencyFormat(formatNumber(text))}
            </div>
          );
        }
        return text;
      },
      onCell: (record: ManagerPeriods) => ({
        record,
        inputType: 'number',
        dataIndex: 'sumStartPeriod',
        title: 'Входная сумма',
        editing: isEditing(record),
      }),
    },
    {
      title: 'Выходная сумма',
      dataIndex: 'sumEndPeriod',
      render: (text: number, record: ManagerPeriods) => {
        if (!isEditing(record)) {
          return (
            <div className="text-text01">
              {TableUtils.createCurrencyFormat(formatNumber(text))}
            </div>
          );
        }
        return text;
      },
      onCell: (record: ManagerPeriods) => ({
        record,
        inputType: 'number',
        dataIndex: 'sumEndPeriod',
        title: 'Выходная сумма',
        editing: isEditing(record),
      }),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (text: string) => {
        const statusOption = statusOptions.find(
          option => option.value === text
        );
        return statusOption ? getStatusTag(statusOption.name) : text;
      },
    },
    {
      title: 'Недостача',
      dataIndex: 'shortage',
      render: (text: number) => {
        return (
          <div className={`${text < 0 ? 'text-errorFill' : 'text-text01'}`}>
            {formatNumber(text)}
          </div>
        );
      },
      onCell: (record: ManagerPeriods) => ({
        record,
        inputType: 'number',
        dataIndex: 'shortage',
        title: 'Недостача',
        editing: false,
      }),
    },
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      render: (text: number) => {
        const worker = workers.find(worker => worker.value === text);
        return worker ? worker.name : text;
      },
      onCell: (record: ManagerPeriods) => ({
        record,
        inputType: 'text',
        dataIndex: 'userId',
        title: 'Пользователь',
        editing: false,
      }),
    },
  ];

  if (canEdit || canDelete) {
    columnsExpanse.push({
      title: 'Действия',
      dataIndex: 'actions',
      render: (_: unknown, record: ManagerPeriods) => {
        const editable = isEditing(record);

        if (editable) {
          return (
            <Space className="flex space-x-4">
              <div className="cursor-pointer text-errorFill" onClick={cancel}>
                <CloseOutlined />
              </div>
              <div
                className="cursor-pointer text-successFill"
                onClick={() => save(record.id)}
              >
                <CheckOutlined />
              </div>
            </Space>
          );
        }

        const menuItems = [];
        if (canEdit && record.status !== ManagerReportPeriodStatus.SENT) {
          menuItems.push({ key: 'edit', label: 'Редактировать' });
        }
        if (canDelete && record.status !== ManagerReportPeriodStatus.SENT) {
          menuItems.push({ key: 'delete', label: 'Удалить', danger: true });
        }

        if (menuItems.length === 0) return null; // User has no access

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === 'edit') edit(record);
                else if (key === 'delete') handleDelete(record.id);
              },
            }}
            trigger={['click']}
          >
            <div className="cursor-pointer text-primary02">
              <MoreOutlined style={{ fontSize: 18 }} />
            </div>
          </Dropdown>
        );
      },
    });
  }

  const memoizedColumns = columnsExpanse.map(col => {
    if (!col.onCell) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ManagerPeriods) => col.onCell!(record),
    };
  });

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  type FieldType = keyof typeof defaultValues;

  const handleInputChange = (field: FieldType, value: Date | number) => {
    const numericFields = ['sumStartPeriod', 'sumEndPeriod', 'userId'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setDrawerOpen(false);
  };

  const onSubmit = async () => {
    setLoadingManagerPaper(true);
    try {
      await createManagerPaperPeriod({
        startPeriod: formData.startPeriod,
        endPeriod: formData.endPeriod,
        sumStartPeriod: formData.sumStartPeriod,
        sumEndPeriod: formData.sumEndPeriod,
        userId: formData.userId,
      });

      await mutateManagerPeriods();
      resetForm();
      showToast(t('success.recordCreated'), 'success');
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setLoadingManagerPaper(false);
    }
  };

  const canUpdate = hasPermission(userPermissions, [
    { action: 'manage', subject: 'ManagerPaper' },
    { action: 'update', subject: 'ManagerPaper' },
  ]);

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.reportFor')}
          </span>
        </div>
        {canUpdate && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="hidden sm:flex">{t('routes.add')}</span>
          </Button>
        )}
      </div>

      <div className="mt-5">
        <GeneralFilters
          count={managerPeriods.length}
          display={['dateTime', 'employee', 'count']}
        />

        <div className="mt-5">
          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              loading={periodsLoading}
              dataSource={managerPeriods}
              columns={memoizedColumns}
              rowClassName="editable-row"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalCount,
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
          </Form>
        </div>
      </div>

      <Drawer
        placement="right"
        size="large"
        onClose={resetForm}
        open={drawerOpen}
        title={t('pos.creating')}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 w-full max-w-2xl mx-auto p-4"
        >
          <DateInput
            title={`${t('finance.begin')}*`}
            classname="w-44"
            value={formData.startPeriod ? dayjs(formData.startPeriod) : null}
            changeValue={date =>
              handleInputChange(
                'startPeriod',
                date ? date.toDate() : new Date()
              )
            }
            error={!!errors.startPeriod}
            {...register('startPeriod', { required: 'Start Date is required' })}
            helperText={errors.startPeriod?.message || ''}
          />
          <DateInput
            title={`${t('finance.end')}*`}
            classname="w-44"
            value={formData.endPeriod ? dayjs(formData.endPeriod) : null}
            changeValue={date =>
              handleInputChange('endPeriod', date ? date.toDate() : new Date())
            }
            error={!!errors.endPeriod}
            {...register('endPeriod', { required: 'End Date is required' })}
            helperText={errors.endPeriod?.message || ''}
          />
          <Input
            title={`${t('analysis.sumStart')}*`}
            type="number"
            classname="w-44"
            showIcon={true}
            IconComponent={<div className="text-text02 text-xl">₽</div>}
            value={formData.sumStartPeriod}
            changeValue={e =>
              handleInputChange('sumStartPeriod', Number(e.target.value))
            }
            error={!!errors.sumStartPeriod}
            {...register('sumStartPeriod', {
              required: 'sumStartPeriod is required',
            })}
            helperText={errors.sumStartPeriod?.message || ''}
          />
          <Input
            title={`${t('analysis.sumEnd')}*`}
            type="number"
            classname="w-44"
            showIcon={true}
            IconComponent={<div className="text-text02 text-xl">₽</div>}
            value={formData.sumEndPeriod}
            changeValue={e =>
              handleInputChange('sumEndPeriod', Number(e.target.value))
            }
            error={!!errors.sumEndPeriod}
            {...register('sumEndPeriod', {
              required: 'sumEndPeriod is required',
            })}
            helperText={errors.sumEndPeriod?.message || ''}
          />
          <DropdownInput
            title={`${t('equipment.user')}*`}
            options={workers}
            classname="w-80"
            {...register('userId', {
              required: 'User ID is required',
              validate: value => value !== 0 || 'User ID is required',
            })}
            value={formData.userId}
            onChange={value => {
              handleInputChange('userId', value);
              updateSearchParams(searchParams, setSearchParams, {
                userId: value,
              });
            }}
            error={!!errors.userId}
            helperText={errors.userId?.message || ''}
          />
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button onClick={() => resetForm()}>
              {t('organizations.cancel')}
            </Button>
            <Button
              htmlType="submit"
              loading={loadingManagerPaper}
              type="primary"
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default MonthlyExpanse;
