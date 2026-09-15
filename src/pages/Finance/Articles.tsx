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
import { getApiErrorMessage } from '@/services/api/finance/fintablo-errors';
import PaperTypeField from './PaperTypeField';
import {
  applyGroupChange,
  isPaperTypeSelected,
  mapPaperTypeOptions,
  shouldFetchPaperTypesByGroup,
} from './paperGroupType';
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
  getPaperGroupLabel,
  getWritablePaperGroupOptions,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import hasPermission from '@/permissions/hasPermission';
import {
  FINTABLO_PENDING_POLL_MS,
  hasPendingFintabloSync,
  type FintabloSyncStatus,
} from '@/services/api/finance/fintablo';
import FinTabloSyncCell from './FinTabloSyncCell';

const { Title, Text } = Typography;
const RESTRICTED_PAPER_TYPE_IDS = [64, 67];

interface FinancialCardProps {
  title: string;
  amount: string;
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
  fintabloSyncStatus?: FintabloSyncStatus | null;
  fintabloLastError?: string | null;
}

type ManagerPaperBody = {
  group?: ManagerPaperGroup;
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
  const form = Form.useFormInstance();
  const watchedGroup = Form.useWatch('group', form) as
    | ManagerPaperGroup
    | undefined;
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
    dataIndex === 'paperTypeId' && shouldFetchPaperTypesByGroup(watchedGroup)
      ? ['get-paper-type-by-group', watchedGroup]
      : null,
    () => getAllManagerPaperTypes(watchedGroup),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: false,
      shouldRetryOnError: false,
    }
  );

  const poses: { name: string; value: number | undefined }[] = (
    posData?.map(item => ({ name: item.name, value: item.id })) || []
  ).sort((a, b) => a.name.localeCompare(b.name));

  const paperTypes = mapPaperTypeOptions(paperTypeData);

  const groups = getWritablePaperGroupOptions(key => t(key));

  const inputNode =
    dataIndex === 'group' ? (
      <SearchDropdownInput
        options={groups}
        value={form.getFieldValue(dataIndex)}
        onChange={value => {
          form.setFieldValue(dataIndex, value);
          form.setFieldValue('paperTypeId', undefined);
        }}
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
        isDisabled={!shouldFetchPaperTypesByGroup(watchedGroup)}
        placeholder={t('finance.selectGroupFirst')}
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
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={
            dataIndex === 'paperTypeId'
              ? [{ required: true, message: t('finance.selectArticle') }]
              : dataIndex === 'group'
                ? [{ required: true, message: t('finance.selectGroupFirst') }]
                : undefined
          }
        >
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
  const writableGroups = useMemo(
    () => getWritablePaperGroupOptions(key => t(key)),
    [t]
  );
  const [form] = Form.useForm();
  const [data, setData] = useState<DataType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [editingKey, setEditingKey] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();
  const userPermissions = usePermissions();

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
      organizationId: user.organizationId,
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
      user.organizationId,
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

  const swrKeyManagerData = `get-manager-data-${filterParams.group}-${filterParams.posId}-${filterParams.paperTypeId}-${filterParams.userId}-${filterParams.dateStartEvent}-${filterParams.dateEndEvent}-${filterParams.page}-${filterParams.size}-${filterParams.organizationId}`;
  
  const { data: allManagersData, isLoading: loadingManagerData } = useSWR(
    swrKeyManagerData,
    () => getAllManagerPaper(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
      refreshInterval: latestData =>
        hasPendingFintabloSync(
          (latestData?.managerPapers ?? []).map(paper => paper.props)
        )
          ? FINTABLO_PENDING_POLL_MS
          : 0,
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
      amount:
        allManagersGraphData?.receipt.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || '0.00',
      currency: '₽',
      trend: 'up' as const,
      color: '#52c41a',
      backgroundColor: '#f6ffed',
    },
    {
      title: 'Расходы',
      amount:
        allManagersGraphData?.expenditure.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || '0.00',
      currency: '₽',
      trend: 'down' as const,
      color: '#ff4d4f',
      backgroundColor: '#fff2f0',
    },
    {
      title: 'Баланс',
      amount:
        allManagersGraphData?.balance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || '0.00',
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

  const paperTypes = mapPaperTypeOptions(paperTypeData);

  useEffect(() => {
    if (allManagersData && workerData) {
      setTotalCount(allManagersData.totalCount || 0);
      
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
            fintabloSyncStatus: man.props.fintabloSyncStatus,
            fintabloLastError: man.props.fintabloLastError,
          };
        }
      );

      setData(temporaryData);
    }
  }, [allManagersData, workerData]);

  useEffect(() => {
    const restrictedKeys = data
      .filter(item => RESTRICTED_PAPER_TYPE_IDS.includes(item.paperTypeId))
      .map(item => item.key);
    setSelectedRowKeys(prev => prev.filter(key => !restrictedKeys.includes(String(key))));
  }, [data]);

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

        if (!isPaperTypeSelected(updatedItem.paperTypeId)) {
          showToast(t('finance.selectArticle'), 'error');
          return;
        }

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
      if (!getApiErrorMessage(error)) {
        showToast(t('errors.other.failedToUpdateRecord'), 'error');
      }
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
    getCheckboxProps: (record: DataType) => ({
      disabled: RESTRICTED_PAPER_TYPE_IDS.includes(record.paperTypeId), 
    }),
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
      render: (value: string) => getPaperGroupLabel(value, key => t(key)),
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
      render: (value: number) =>
        `${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ₽`,
    },
    {
      title: t('equipment.comment'),
      dataIndex: 'comment',
      width: '15%',
      editable: true,
    },
    {
      title: t('fintablo.syncColumn'),
      dataIndex: 'fintabloSyncStatus',
      width: '12%',
      editable: false,
      render: (_: unknown, record: DataType) => (
        <Can
          requiredPermissions={[
            { action: 'manage', subject: 'ManagerPaper' },
            { action: 'update', subject: 'ManagerPaper' },
          ]}
          userPermissions={userPermissions}
        >
          {canRetry => (
            <FinTabloSyncCell
              paperId={record.id}
              fintabloSyncStatus={record.fintabloSyncStatus}
              fintabloLastError={record.fintabloLastError}
              canRetry={canRetry}
              onRetried={() => {
                mutate(swrKeyManagerData);
              }}
            />
          )}
        </Can>
      ),
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
        const isPaperTypeRestricted = RESTRICTED_PAPER_TYPE_IDS.includes(record.paperTypeId);
    
        return (
          <Can
            requiredPermissions={[
              { action: 'manage', subject: 'ManagerPaper' },
              { action: 'create', subject: 'ManagerPaper' },
            ]}
            userPermissions={userPermissions}
          >
            {allowed => {
              if (!allowed || isPaperTypeRestricted) {
                return null;
              }
    
              return (
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
              );
            }}
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
    group: undefined,
    posId: 0,
    paperTypeId: 0,
    eventDate: new Date(),
    sum: 0,
    userId: user.id,
    comment: undefined,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { data: formPaperTypeData } = useSWR(
    shouldFetchPaperTypesByGroup(formData.group)
      ? ['get-paper-type-by-group', formData.group]
      : null,
    () => getAllManagerPaperTypes(formData.group),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: false,
      shouldRetryOnError: false,
    }
  );

  const formPaperTypes = mapPaperTypeOptions(formPaperTypeData);

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
    async () => {
      if (!formData.group || !isPaperTypeSelected(formData.paperTypeId)) {
        return undefined;
      }
      return createManagerPaper(
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
      );
    }
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

  const handleGroupChange = (value: ManagerPaperGroup | undefined) => {
    setFormData(prev => applyGroupChange(prev, value));
    setValue('group', value);
    setValue('paperTypeId', 0);
  };

  const handlePaperTypeSelect = (value: number) => {
    setFormData(prev => ({ ...prev, paperTypeId: value }));
    setValue('paperTypeId', value);
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setIsOpenModal(false);
  };

  const onSubmit = async () => {
    if (!formData.group) {
      showToast(t('finance.selectGroupFirst'), 'error');
      return;
    }
    if (!isPaperTypeSelected(formData.paperTypeId)) {
      showToast(t('finance.selectArticle'), 'error');
      return;
    }
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
      if (!getApiErrorMessage(error)) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    }
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

  const allowed = hasPermission(
    [
      { action: 'manage', subject: 'ManagerPaper' },
      { action: 'update', subject: 'ManagerPaper' }
    ],
    userPermissions
  );

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
        open={isOpenModal}
        onCancel={() => {
          resetForm();
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
              placeholder={t('finance.group')}
              options={writableGroups}
              {...register('group', {
                required: t('finance.selectGroupFirst'),
              })}
              value={formData.group}
              onChange={value => {
                handleGroupChange(value);
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
            <PaperTypeField
              paperTypeId={formData.paperTypeId}
              paperTypes={formPaperTypes}
              disabled={!shouldFetchPaperTypesByGroup(formData.group)}
              onSelect={handlePaperTypeSelect}
            />
            <Space className="w-full">
              <div>
                <div className="text-text02 text-sm">
                  {t('finance.articleType')}
                </div>
                <Tag
                  color={
                    formPaperTypes.find(
                      paper => paper.value === formData.paperTypeId
                    )?.type === 'EXPENDITURE'
                      ? 'red'
                      : formPaperTypes.find(
                            paper => paper.value === formData.paperTypeId
                          )?.type === 'RECEIPT'
                        ? 'green'
                        : ''
                  }
                  className="h-10 w-40 flex items-center justify-center"
                >
                  {formPaperTypes.find(
                    paper => paper.value === formData.paperTypeId
                  )?.type
                    ? t(
                        `finance.${formPaperTypes.find(paper => paper.value === formData.paperTypeId)?.type}`
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
              onWheel={e => e.currentTarget.blur()}
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
                disabled={
                  !shouldFetchPaperTypesByGroup(formData.group) ||
                  !isPaperTypeSelected(formData.paperTypeId)
                }
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
                  total: totalCount,
                  showSizeChanger: true,
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
