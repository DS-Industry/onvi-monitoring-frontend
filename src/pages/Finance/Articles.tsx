import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import SearchDropdownInput from '@/components/ui/Input/SearchDropdownInput';
import useSWR, { mutate } from 'swr';
import { getPoses, getWorkers } from '@/services/api/equipment';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import useFormHook from '@/hooks/useFormHook';
import dayjs, { Dayjs } from 'dayjs';
import DateInput from '@/components/ui/Input/DateInput';
import {
  createManagerPaper,
  deleteManagerPapers,
  getAllManagerPaper,
  getAllManagerPaperGraph,
  getAllManagerPaperTypes,
  getAllWorkers,
  ManagerParams,
  updateManagerPaper,
} from '@/services/api/finance';
import TableSkeleton from '@/components/ui/Table/TableSkeleton';
import useSWRMutation from 'swr/mutation';
import MultilineInput from '@/components/ui/Input/MultilineInput';
import { useToast } from '@/components/context/useContext';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '@/hooks/useUserStore';
import Card from 'antd/es/card';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Typography from 'antd/es/typography';
import Space from 'antd/es/space';
import Form from 'antd/es/form';
import Popconfirm from 'antd/es/popconfirm';
import Table from 'antd/es/table';
import AntDButton from 'antd/es/button';
import AntInput from 'antd/es/input';
import DatePicker from 'antd/es/date-picker';
import Skeleton from 'antd/es/skeleton';
import Tag from 'antd/es/tag';
import Upload from 'antd/es/upload';
import { Modal, type TableProps } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
  ManagerPaperGroup,
  groups,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import hasPermission from '@/permissions/hasPermission';

const { Title, Text } = Typography;

interface FinancialCardProps {
  title: string;
  amount: number;
  currency: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
  backgroundColor: string;
  loading?: boolean;
}

interface DataType {
  key: string;
  id: number;
  group: string;
  posId: number;
  paperTypeId: number;
  eventDate: Dayjs;
  sum: number;
  comment: string;
}

type ManagerPaperBody = {
  group: ManagerPaperGroup;
  posId: number;
  paperTypeId: number;
  eventDate: Date;
  sum: number;
  userId: number;
  comment?: string;
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
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const city = Number(searchParams.get('city')) || undefined;
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

  const { data: paperTypeData } = useSWR(
    [`get-paper-type`],
    () => getAllManagerPaperTypes(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const poses: { name: string; value: number | undefined }[] = (
    posData?.map(item => ({ name: item.name, value: item.id })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const paperTypes: { name: string; value: number }[] = (
    paperTypeData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const groups: { name: string; value: string }[] = [
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
    { value: ManagerPaperGroup.CONSTRUCTION, name: t('finance.CONSTRUCTION') },
    {
      value: ManagerPaperGroup.MAINTENANCE_REPAIR,
      name: t('finance.MAINTENANCE_REPAIR'),
    },
    {
      value: ManagerPaperGroup.TRANSPORTATION_COSTS,
      name: t('finance.TRANSPORTATION_COSTS'),
    },
  ];

  const form = Form.useFormInstance();

  const inputNode =
    dataIndex === 'group' ? (
      <SearchDropdownInput
        options={groups}
        value={form.getFieldValue(dataIndex)}
        onChange={value => form.setFieldValue(dataIndex, value)}
        classname="w-80"
        noHeight={true}
      />
    ) : dataIndex === 'posId' ? (
      <SearchDropdownInput
        options={poses}
        value={form.getFieldValue(dataIndex)}
        onChange={value => form.setFieldValue(dataIndex, value)}
        classname="w-44"
        noHeight={true}
      />
    ) : dataIndex === 'paperTypeId' ? (
      <SearchDropdownInput
        options={paperTypes}
        value={form.getFieldValue(dataIndex)}
        onChange={value => form.setFieldValue(dataIndex, value)}
        classname="w-44"
        noHeight={true}
      />
    ) : inputType === 'date' ? (
      <DatePicker
        format={'DD-MM-YYYY'}
        style={{ width: '150px' }}
        value={form.getFieldValue(dataIndex)}
        onChange={date => form.setFieldValue(dataIndex, date)}
      />
    ) : inputType === 'number' ? (
      <AntInput
        type="number"
        className="w-32"
        suffix={<div className="text-text02">₽</div>}
        value={form.getFieldValue(dataIndex)}
        onChange={e =>
          form.setFieldValue(dataIndex, parseFloat(e.target.value))
        }
      />
    ) : (
      <AntInput
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

const FinancialCard: React.FC<FinancialCardProps> = ({
  title,
  amount,
  currency,
  trend,
  color,
  backgroundColor,
  loading,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
        );
      case 'down':
        return (
          <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
        );
      case 'neutral':
        return (
          <LineChartOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
        );
      default:
        return null;
    }
  };

  return (
    <Card
      style={{
        borderRadius: '12px',
      }}
      bodyStyle={{
        padding: '24px',
      }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text
              style={{ color: '#8c8c8c', fontSize: '14px', fontWeight: 400 }}
            >
              {title}
            </Text>
            <Title
              level={2}
              style={{
                margin: 0,
                color,
                fontSize: '28px',
                fontWeight: 700,
              }}
            >
              {loading ? (
                <Skeleton.Button
                  active={true}
                  size={'default'}
                  shape={'default'}
                  block={false}
                />
              ) : (
                <>
                  {currency} {amount}
                </>
              )}
            </Title>
          </div>
          <div
            style={{
              backgroundColor,
              borderRadius: '6px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              height: '48px',
              width: '48px',
              justifyContent: 'center',
              paddingBottom: '0px',
            }}
          >
            {getTrendIcon()}
          </div>
        </div>
      </Space>
    </Card>
  );
};

const Articles: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [data, setData] = useState<DataType[]>([]);
  const [editingKey, setEditingKey] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [searchText, setSearchText] = useState('');
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const groupParam =
    (searchParams.get('group') as ManagerPaperGroup) || undefined;
  const posIdParam = Number(searchParams.get('posId')) || undefined;
  const paperTypeIdParam = Number(searchParams.get('paperTypeId')) || undefined;
  const userIdParam = Number(searchParams.get('userId')) || undefined;
  const dateStartParam = searchParams.get('dateStart')
    ? dayjs(searchParams.get('dateStart')).toDate()
    : undefined;
  const dateEndParam = searchParams.get('dateEnd')
    ? dayjs(searchParams.get('dateEnd')).toDate()
    : undefined;
  const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;

  const city = Number(searchParams.get('city')) || undefined;

  const filterParams: ManagerParams = useMemo(
    () => ({
      group: groupParam,
      posId: posIdParam,
      paperTypeId: paperTypeIdParam,
      userId: userIdParam,
      dateStartEvent: dateStartParam,
      dateEndEvent: dateEndParam,
      page: currentPage,
      size: pageSize,
    }),
    [
      groupParam,
      posIdParam,
      paperTypeIdParam,
      userIdParam,
      dateStartParam,
      dateEndParam,
      currentPage,
      pageSize,
    ]
  );

  const isEditing = (record: DataType) => record.key === editingKey;

  const edit = (record: Partial<DataType> & { key: React.Key }) => {
    form.setFieldsValue({ ...record, date: dayjs(record.eventDate) });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const swrKeyManagerData = `get-manager-data-${filterParams.group}-${filterParams.posId}-${filterParams.paperTypeId}-${filterParams.userId}-${filterParams.dateStartEvent}-${filterParams.dateEndEvent}-${filterParams.page}-${filterParams.size}`;

  const { data: allManagersData, isLoading: loadingManagerData } = useSWR(
    swrKeyManagerData,
    () => getAllManagerPaper(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const swrKeyManagerPaperGraph = `get-manager-graph-data-${filterParams.group}-${filterParams.posId}-${filterParams.paperTypeId}-${filterParams.userId}-${filterParams.dateStartEvent}-${filterParams.dateEndEvent}-${filterParams.page}-${filterParams.size}`;

  const { data: allManagersGraphData, isLoading: loadingGraphData } = useSWR(
    swrKeyManagerPaperGraph,
    () => getAllManagerPaperGraph(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
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

  const financialData = [
    {
      title: 'Доходы',
      amount: allManagersGraphData?.receipt || 0,
      currency: '₽',
      trend: 'up' as const,
      color: '#52c41a',
      backgroundColor: '#f6ffed',
    },
    {
      title: 'Расходы',
      amount: allManagersGraphData?.expenditure || 0,
      currency: '₽',
      trend: 'down' as const,
      color: '#ff4d4f',
      backgroundColor: '#fff2f0',
    },
    {
      title: 'Баланс',
      amount: allManagersGraphData?.balance || 0,
      currency: '₽',
      trend: 'neutral' as const,
      color: '#1890ff',
      backgroundColor: '#f0f5ff',
    },
  ];

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

  const { data: paperTypeData } = useSWR(
    [`get-paper-type`],
    () => getAllManagerPaperTypes(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const poses: { name: string; value: number | undefined }[] = (
    posData?.map(item => ({ name: item.name, value: item.id })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const paperTypes: { name: string; value: number; type: string }[] = (
    paperTypeData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
      type: item.props.type,
    })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (allManagersData && workerData) {
      const workerMap = new Map<
        number,
        { id: number; name: string; surname: string }
      >();
      workerData.forEach(work => workerMap.set(work.id, work));

      const temporaryData: DataType[] = allManagersData.managerPapers.map(
        man => {
          const creator = workerMap.get(man.props.createdById);
          return {
            key: `${man.props.id}`,
            id: man.props.id,
            group: man.props.group,
            posId: man.props.posId,
            paperTypeId: man.props.paperTypeId,
            eventDate: dayjs(man.props.eventDate),
            sum: man.props.sum,
            comment: man.props.comment || '',
            createdByName: creator ? `${creator.name} ${creator.surname}` : '-',
          };
        }
      );

      setData(temporaryData);
    }
  }, [allManagersData, workerData]);

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as DataType;

      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
          eventDate: row.eventDate ? row.eventDate : item.eventDate,
        };

        // Prepare API payload with correct types
        const apiPayload = {
          managerPaperId: item.id,
          group:
            updatedItem.group !== item.group
              ? (updatedItem.group as ManagerPaperGroup)
              : undefined,
          posId:
            updatedItem.posId !== item.posId ? updatedItem.posId : undefined,
          paperTypeId:
            updatedItem.paperTypeId !== item.paperTypeId
              ? updatedItem.paperTypeId
              : undefined,
          eventDate:
            updatedItem.eventDate !== item.eventDate
              ? dayjs.isDayjs(updatedItem.eventDate)
                ? updatedItem.eventDate.toDate()
                : updatedItem.eventDate
              : undefined,
          sum: updatedItem.sum !== item.sum ? updatedItem.sum : undefined,
          comment:
            updatedItem.comment !== item.comment
              ? updatedItem.comment
              : undefined,
        };

        // Call the API
        const result = await updateManager(apiPayload);

        if (result) {
          mutate(swrKeyManagerData);
          mutate(swrKeyManagerPaperGraph);
          newData.splice(index, 1, updatedItem);
          setData(newData);
          setEditingKey('');

          // Clear selected file after successful update
          setSelectedFile(null);
          showToast(t('success.recordUpdated'), 'success');
        }
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (error) {
      console.log('Update Failed:', error);
      showToast(t('errors.other.failedToUpdateRecord'), 'error');
    }
  };

  // Add new row function
  const handleAddRow = () => {
    setIsOpenModal(true);
  };

  const handleDeleteRow = async () => {
    try {
      const result = await mutate(
        [`delete-manager-data`],
        () =>
          deleteManagerPapers({ ids: selectedRowKeys.map(key => Number(key)) }),
        false
      );

      if (result) {
        mutate(swrKeyManagerData);
        mutate(swrKeyManagerPaperGraph);
        setSelectedRowKeys([]);
        if (selectedRowKeys.includes(editingKey)) {
          setEditingKey('');
        }
      }
    } catch (error) {
      console.error('Error deleting nomenclature:', error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      width: '5%',
      editable: false,
    },
    {
      title: t('finance.group'),
      dataIndex: 'group',
      width: '10%',
      editable: true,
      render: (value: string) => groups.find(pos => pos.value === value)?.name,
    },
    {
      title: t('warehouse.purpose'),
      dataIndex: 'posId',
      width: '10%',
      editable: true,
      render: (value: number) => poses.find(pos => pos.value === value)?.name,
    },
    {
      title: t('finance.article'),
      dataIndex: 'paperTypeId',
      width: '10%',
      editable: true,
      render: (value: number) => (
        <div>
          <Tag
            color={
              paperTypes.find(paper => paper.value === value)?.type ===
              'EXPENDITURE'
                ? 'red'
                : paperTypes.find(paper => paper.value === value)?.type ===
                    'RECEIPT'
                  ? 'green'
                  : ''
            }
          >
            {paperTypes.find(paper => paper.value === value)?.name}
          </Tag>
        </div>
      ),
    },
    {
      title: t('marketing.date'),
      dataIndex: 'eventDate',
      width: '10%',
      editable: true,
      render: (value: Dayjs) => value?.format('DD-MM-YYYY'),
    },
    {
      title: t('finance.sum'),
      dataIndex: 'sum',
      width: '5%',
      editable: true,
      render: (value: number) => `${value.toLocaleString('ru-RU')} ₽`,
    },
    {
      title: t('equipment.comment'),
      dataIndex: 'comment',
      width: '15%',
      editable: true,
    },
    {
      title: t('table.headers.created'),
      dataIndex: 'createdByName',
      width: '20%',
      editable: false,
    },
    {
      title: t('marketing.operations'),
      dataIndex: 'operation',
      width: '25%',
      render: (_: unknown, record: DataType) => {
        const editable = isEditing(record);
        return (
          <Can
            requiredPermissions={[
              { action: 'manage', subject: 'ManagerPaper' },
              { action: 'update', subject: 'ManagerPaper' },
            ]}
            userPermissions={userPermissions}
          >
            {allowed =>
              allowed && (
                <div>
                  {editable ? (
                    <span className="flex space-x-4">
                      <AntDButton type="primary" onClick={cancel}>
                        Отмена
                      </AntDButton>
                      <AntDButton
                        onClick={() => save(record.key)}
                        loading={updatingManager}
                      >
                        Сохранять
                      </AntDButton>
                    </span>
                  ) : (
                    <Typography.Link
                      disabled={editingKey !== ''}
                      onClick={() => edit(record)}
                    >
                      Редактировать
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

  const mergedColumns: TableProps<DataType>['columns'] = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        inputType:
          col.dataIndex === 'eventDate'
            ? 'date'
            : col.dataIndex === 'sum'
              ? 'number'
              : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const defaultValues: ManagerPaperBody = {
    group: ManagerPaperGroup.WAGES,
    posId: 0,
    paperTypeId: 0,
    eventDate: new Date(),
    sum: 0,
    userId: user.id,
    comment: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { data: allWorkersData } = useSWR(
    formData.posId !== 0 ? [`get-all-workers`, formData.posId] : null,
    () => getAllWorkers(formData.posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const allWorkers: { name: string; value: number }[] = [
    ...(allWorkersData?.map(work => ({
      name: `${work.props.name} ${work.props.surname}`,
      value: work.props.id,
    })) || []),
  ];

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createManager, isMutating } = useSWRMutation(
    ['create-manager'],
    async () =>
      createManagerPaper(
        {
          group: formData.group,
          posId: formData.posId,
          paperTypeId: formData.paperTypeId,
          eventDate: formData.eventDate,
          sum: formData.sum,
          userId: formData.userId,
          comment: formData.comment,
        },
        selectedFile
      )
  );

  const { trigger: updateManager, isMutating: updatingManager } =
    useSWRMutation(
      ['update-manager'],
      async (
        _,
        {
          arg,
        }: {
          arg: {
            managerPaperId: number;
            group?: ManagerPaperGroup;
            posId?: number;
            paperTypeId?: number;
            eventDate?: Date;
            sum?: number;
            userId?: number;
            comment?: string;
          };
        }
      ) => {
        return updateManagerPaper(arg, null);
      }
    );

  type FieldType =
    | 'group'
    | 'sum'
    | 'posId'
    | 'paperTypeId'
    | 'eventDate'
    | 'userId'
    | 'comment';

  const handleInputChange = (field: FieldType, value: string) => {
    const numericFields = ['paperTypeId', 'posId', 'sum'];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setIsOpenModal(false);
  };

  const onSubmit = async () => {
    try {
      const result = await createManager();
      if (result) {
        mutate(swrKeyManagerData);
        mutate(swrKeyManagerPaperGraph);
        resetForm();
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      console.error('Error during form submission: ', error);
    }
  };

  const filteredOptions = useMemo(() => {
    return paperTypes.filter(opt =>
      opt.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, paperTypes]);

  const handleSelect = (value: number) => {
    setFormData(prev => ({ ...prev, ['paperTypeId']: value }));
    setValue('paperTypeId', value);
  };

  const handleConfirm = () => {
    setIsStateOpen(false);
  };

  const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    // Get the actual file from the fileList
    const file = (newFileList[0]?.originFileObj as File) || null;
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
    }
  };

  const userPermissions = usePermissions();

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'ManagerPaper' },
    { action: 'update', subject: 'ManagerPaper' },
  ]);

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.articles')}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <GeneralFilters
          count={data.length}
          display={[
            'dateTime',
            'count',
            'employee',
            'paper',
            'group',
            'city',
            'pos',
          ]}
        />
      </div>

      <Modal
        open={isStateOpen}
        onCancel={() => setIsStateOpen(false)}
        footer={false}
        className="w-full sm:w-[600px] max-h-[550px] overflow-y-auto"
        maskClosable={false}
      >
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
            {t('finance.addN')}
          </h2>
        </div>
        <Input
          placeholder="Search state type..."
          value={searchText}
          changeValue={e => setSearchText(e.target.value)}
          classname="mb-3"
        />

        {/* Filtered List */}
        <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  formData.paperTypeId === opt.value ? 'text-primary02' : ''
                }`}
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">No matches found.</div>
          )}
        </div>
        <Button
          disabled={!formData.paperTypeId}
          handleClick={handleConfirm}
          title={t('finance.confirm')}
          classname="mt-4 w-full"
        />
      </Modal>
      <Modal
        open={isOpenModal}
        onCancel={() => {
          setIsOpenModal(false);
        }}
        footer={false}
        className="w-full sm:w-[600px] max-h-[550px] overflow-y-auto"
        maskClosable={false}
      >
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
            {t('roles.create')}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col space-y-4 text-text02">
            <SearchDropdownInput
              title={t('finance.group')}
              classname="w-full"
              placeholder="Выберите объект"
              options={groups}
              {...register('group', {
                required: 'Group ID is required',
              })}
              value={formData.group}
              onChange={value => {
                handleInputChange('group', value);
              }}
              error={!!errors.group}
              errorText={errors.group?.message}
            />
            <SearchDropdownInput
              title={t('analysis.posId')}
              classname="w-full"
              placeholder="Выберите объект"
              options={poses}
              {...register('posId', {
                required: 'Pos ID is required',
                validate: value => value !== 0 || 'Pos ID is required',
              })}
              value={formData.posId}
              onChange={value => {
                handleInputChange('posId', value);
              }}
              error={!!errors.posId}
              errorText={errors.posId?.message}
            />
            <Space.Compact className="w-full">
              <div className="w-full">
                <div className="text-sm text-text02">
                  {t('finance.article')}
                </div>
                <div className="w-full border h-10 flex items-center justify-center">
                  {paperTypes.find(
                    paper => paper.value === formData.paperTypeId
                  )?.name || ''}
                </div>
              </div>
              <AntDButton
                onClick={() => setIsStateOpen(true)}
                type="primary"
                className="h-10 mt-[20px]"
              >
                {t('finance.op')}
              </AntDButton>
            </Space.Compact>
            <Space className="w-full">
              <div>
                <div className="text-text02 text-sm">
                  {t('finance.articleType')}
                </div>
                <Tag
                  color={
                    paperTypes.find(
                      paper => paper.value === formData.paperTypeId
                    )?.type === 'EXPENDITURE'
                      ? 'red'
                      : paperTypes.find(
                            paper => paper.value === formData.paperTypeId
                          )?.type === 'RECEIPT'
                        ? 'green'
                        : ''
                  }
                  className="h-10 w-40 flex items-center justify-center"
                >
                  {paperTypes.find(
                    paper => paper.value === formData.paperTypeId
                  )?.type
                    ? t(
                        `finance.${paperTypes.find(paper => paper.value === formData.paperTypeId)?.type}`
                      )
                    : ''}
                </Tag>
              </div>
              <DateInput
                title={t('finance.dat')}
                classname="w-full sm:w-40"
                value={formData.eventDate ? dayjs(formData.eventDate) : null}
                changeValue={eventDate =>
                  handleInputChange(
                    'eventDate',
                    eventDate ? eventDate.format('YYYY-MM-DDTHH:mm') : ''
                  )
                }
                error={!!errors.eventDate}
                {...register('eventDate', {
                  required: 'eventDate is required',
                })}
                helperText={errors.eventDate?.message || ''}
              />
            </Space>
            <Input
              title={t('finance.sum')}
              type="number"
              classname="w-full"
              showIcon={true}
              IconComponent={<div className="text-text02 text-xl">₽</div>}
              value={formData.sum}
              changeValue={e => handleInputChange('sum', e.target.value)}
              error={!!errors.sum}
              {...register('sum', { required: 'sum is required' })}
              helperText={errors.sum?.message || ''}
            />
            <MultilineInput
              title={t('equipment.comment')}
              classname="w-full"
              value={formData.comment}
              changeValue={e => handleInputChange('comment', e.target.value)}
              {...register('comment')}
            />
            <div>
              <div className="text-text02 text-sm">{t('hr.upload')}</div>
              <Upload
                listType="picture-card"
                showUploadList={true}
                beforeUpload={() => false} // prevent auto upload
                onChange={handleFileChange}
                fileList={fileList}
                maxCount={1}
                className="w-full upload-full-width"
              >
                {fileList.length >= 1 ? null : (
                  <div className="text-text02 w-full">
                    <PlusOutlined />
                    <div className="mt-2">{t('hr.upload')}</div>
                  </div>
                )}
              </Upload>
            </div>
            <style>
              {`
    .upload-full-width .ant-upload.ant-upload-select {
        width: 100% !important;
        height: auto;
    }
    
    .upload-full-width .ant-upload-list {
        width: 100%;
    }
    
    .upload-full-width .ant-upload-list-picture-card .ant-upload-list-item {
        width: 100%;
        height: auto;
    }
`}
            </style>
            {allowed && (
              <SearchDropdownInput
                title={t('equipment.user')}
                classname="w-full"
                placeholder="Выберите объект"
                options={allWorkers}
                {...register('userId', {
                  required: 'User ID is required',
                  validate: value => value !== 0 || 'User ID is required',
                })}
                value={formData.userId}
                onChange={value => {
                  handleInputChange('userId', value);
                }}
                error={!!errors.userId}
                errorText={errors.userId?.message}
              />
            )}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-6">
              <Button
                title={t('organizations.cancel')}
                type="outline"
                handleClick={() => {
                  setIsOpenModal(false);
                  resetForm();
                }}
              />
              <Button
                title={t('organizations.save')}
                form={true}
                isLoading={isMutating}
              />
            </div>
          </div>
        </form>
      </Modal>
      <div style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          {financialData.map((data, index) => (
            <Col xs={24} sm={8} key={index}>
              <FinancialCard {...data} />
            </Col>
          ))}
        </Row>
      </div>

      <div className="mt-5">
        <div style={{ marginBottom: 16 }}>
          <div className="flex flex-col space-y-4 space-x-0 sm:space-x-2 sm:flex-row sm:space-y-0">
            <Can
              requiredPermissions={[
                { action: 'manage', subject: 'ManagerPaper' },
                { action: 'create', subject: 'ManagerPaper' },
              ]}
              userPermissions={userPermissions}
            >
              {allowed =>
                allowed && (
                  <AntDButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddRow}
                  >
                    {t('finance.addRow')}
                  </AntDButton>
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
                allowed && (
                  <Popconfirm
                    title="Are you sure you want to delete the selected rows?"
                    onConfirm={handleDeleteRow}
                    disabled={selectedRowKeys.length === 0}
                  >
                    <AntDButton
                      danger
                      icon={<DeleteOutlined />}
                      disabled={selectedRowKeys.length === 0}
                    >
                      {t('finance.del')} ({selectedRowKeys.length})
                    </AntDButton>
                  </Popconfirm>
                )
              }
            </Can>
          </div>
        </div>

        <Form form={form} component={false}>
          {loadingManagerData ? (
            <TableSkeleton columnCount={mergedColumns.length} />
          ) : (
            <div>
              <Table<DataType>
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                loading={loadingGraphData}
                rowSelection={rowSelection}
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: data.length,
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
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default Articles;
