import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Popconfirm,
  Space,
  message,
  Checkbox,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, ALL_PAGE_SIZES } from '@/utils/constants';
import { getCurrencyRender } from '@/utils/tableUnits';

interface PartnerDetail {
  id: number;
  startDate: Dayjs;
  endDate: Dayjs;
  percent: number;
  partnerName: string;
  comment?: string;
}

interface ObjectData {
  id: number;
  city: string;
  carWashName: string;
  cost: number;
  includeInReport: boolean;
  partners: PartnerDetail[];
}

const initialMockData: ObjectData[] = [
  {
    id: 1,
    city: 'Воронежская область',
    carWashName: '36 М-01 ул. 9 Января, 68',
    cost: 13301522.00,
    includeInReport: true,
    partners: [
      {
        id: 1,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 1.53,
        partnerName: 'Канищев С.В. (43)',
        comment: '',
      },
      {
        id: 2,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 9.6,
        partnerName: 'Макаренко Д.Ю. (45)',
        comment: '',
      },
      {
        id: 3,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 78.12,
        partnerName: 'Шомин А.В. (41)',
        comment: '',
      },
      {
        id: 4,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 10.75,
        partnerName: 'Канищев Р.В. (44)',
        comment: '',
      },
    ],
  },
  {
    id: 2,
    city: 'Воронежская область',
    carWashName: '36 М-02 ул. Машиностроителей, 10',
    cost: 12350767.00,
    includeInReport: false,
    partners: [
      {
        id: 1,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 1.53,
        partnerName: 'Канищев С.В. (43)',
        comment: '',
      },
      {
        id: 2,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 9.6,
        partnerName: 'Макаренко Д.Ю. (45)',
        comment: '',
      },
      {
        id: 3,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 78.12,
        partnerName: 'Шомин А.В. (41)',
        comment: '',
      },
      {
        id: 4,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 10.75,
        partnerName: 'Канищев Р.В. (44)',
        comment: '',
      },
    ],
  },
  {
    id: 3,
    city: 'Воронежская область',
    carWashName: '36 М-03 ул. Димитрова, 91а',
    cost: 13672094.00,
    includeInReport: true,
    partners: [
      {
        id: 1,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 1.53,
        partnerName: 'Канищев С.В. (43)',
        comment: '',
      },
      {
        id: 2,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 9.6,
        partnerName: 'Макаренко Д.Ю. (45)',
        comment: '',
      },
      {
        id: 3,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 78.12,
        partnerName: 'Шомин А.В. (41)',
        comment: '',
      },
      {
        id: 4,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 10.75,
        partnerName: 'Канищев Р.В. (44)',
        comment: '',
      },
    ],
  },
  {
    id: 4,
    city: 'Воронежская область',
    carWashName: '36 M-05 ул. Остужева, 35а',
    cost: 6504095.00,
    includeInReport: false,
    partners: [
      {
        id: 1,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 1.53,
        partnerName: 'Канищев С.В. (43)',
        comment: '',
      },
      {
        id: 2,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 9.6,
        partnerName: 'Макаренко Д.Ю. (45)',
        comment: '',
      },
      {
        id: 3,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 78.12,
        partnerName: 'Шомин А.В. (41)',
        comment: '',
      },
      {
        id: 4,
        startDate: dayjs('2000-01-01'),
        endDate: dayjs('2100-01-01'),
        percent: 10.75,
        partnerName: 'Канищев Р.В. (44)',
        comment: '',
      },
    ],
  },
];

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  inputType: 'number' | 'text' | 'date' | 'checkbox';
  record: ObjectData | PartnerDetail;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  inputType,
  children,
  ...restProps
}) => {

  const getInputNode = () => {
    switch (inputType) {
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            parser={value => value!.replace(/\s/g, '')}
          />
        );
      case 'date':
        return <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />;
      case 'checkbox':
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox />
          </div>
        );
      default:
        return <Input />;
    }
  };

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }}>
          {getInputNode()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const PercentageOfObjects: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const city = searchParams.get('city') || undefined;

  const [data, setData] = useState<ObjectData[]>(initialMockData);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingParentId, setEditingParentId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    if (!city) return data;
    return data.filter(item => item.city === city);
  }, [data, city]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalCount = filteredData.length;
  const currencyRender = getCurrencyRender();

  const isEditingParent = (record: ObjectData) => editingParentId === record.id;

  const editParent = (record: ObjectData) => {
    const formValues: any = {
      cost: record.cost,
      includeInReport: record.includeInReport,
    };
    record.partners.forEach((partner, idx) => {
      formValues[`partners[${idx}].startDate`] = partner.startDate;
      formValues[`partners[${idx}].endDate`] = partner.endDate;
      formValues[`partners[${idx}].percent`] = partner.percent;
      formValues[`partners[${idx}].partnerName`] = partner.partnerName;
      formValues[`partners[${idx}].comment`] = partner.comment;
    });
    form.setFieldsValue(formValues);
    setEditingParentId(record.id);
  };

  const cancelParent = () => {
    setEditingParentId(null);
    form.resetFields();
  };

  const saveParent = async (record: ObjectData) => {
    try {
      const values = await form.validateFields();
      const newCost = values.cost;
      const newIncludeInReport = values.includeInReport;

      const newPartners = record.partners.map((partner, idx) => ({
        ...partner,
        startDate: values[`partners[${idx}].startDate`],
        endDate: values[`partners[${idx}].endDate`],
        percent: values[`partners[${idx}].percent`],
        partnerName: values[`partners[${idx}].partnerName`],
        comment: values[`partners[${idx}].comment`],
      }));

      const updatedRecord = {
        ...record,
        cost: newCost,
        includeInReport: newIncludeInReport,
        partners: newPartners,
      };

      setData(prev => prev.map(item => (item.id === record.id ? updatedRecord : item)));
      setEditingParentId(null);
      message.success(t('success.recordUpdated'));
    } catch (err) {
      message.error(t('errors.other.failedToUpdateRecord'));
    }
  };

  const handleDeleteRows = () => {
    const newData = data.filter(item => !selectedRowKeys.includes(item.id));
    setData(newData);
    setSelectedRowKeys([]);
    message.success(t('success.recordDeleted'));
  };

  const handleAdd = () => {
    message.info(t('info.addFunctionalityComingSoon'));
  };

  const expandedRowRender = (record: ObjectData) => {
    const editing = isEditingParent(record);

    const partnerColumns: ColumnsType<PartnerDetail> = [
      {
        title: t('shift.startDate'),
        key: 'startDate',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].startDate`;
          if (editing) {
            return (
              <Form.Item name={fieldName} style={{ margin: 0 }}>
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
              </Form.Item>
            );
          }
          return partner.startDate.format('DD.MM.YYYY');
        },
      },
      {
        title: t('marketing.comp'),
        key: 'endDate',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].endDate`;
          if (editing) {
            return (
              <Form.Item name={fieldName} style={{ margin: 0 }}>
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
              </Form.Item>
            );
          }
          return partner.endDate.format('DD.MM.YYYY');
        },
      },
      {
        title: t('finance.percent'),
        key: 'percent',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].percent`;
          if (editing) {
            return (
              <Form.Item name={fieldName} style={{ margin: 0 }}>
                <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            );
          }
          return `${partner.percent}%`;
        },
      },
      {
        title: t('finance.partnerName'),
        key: 'partnerName',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].partnerName`;
          if (editing) {
            return (
              <Form.Item name={fieldName} style={{ margin: 0 }}>
                <Input />
              </Form.Item>
            );
          }
          return partner.partnerName;
        },
      },
      {
        title: t('equipment.comment'),
        key: 'comment',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].comment`;
          if (editing) {
            return (
              <Form.Item name={fieldName} style={{ margin: 0 }}>
                <Input />
              </Form.Item>
            );
          }
          return partner.comment || '-';
        },
      },
    ];

    return (
      <Table
        dataSource={record.partners}
        columns={partnerColumns}
        pagination={false}
        size="small"
        rowKey="id"
      />
    );
  };

  const mainColumns: ColumnsType<ObjectData> = [
    {
      title: t('finance.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('finance.city'),
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: t('finance.carWash'),
      dataIndex: 'carWashName',
      key: 'carWashName',
    },
    {
      title: t('finance.cost'),
      dataIndex: 'cost',
      key: 'cost',
      render: (value: number) => currencyRender(value),
      onCell: (record) => ({
        editing: isEditingParent(record),
        dataIndex: 'cost',
        inputType: 'number',
        record,
      } as any),
    },
    {
      title: t('finance.includeInReport'),
      dataIndex: 'includeInReport',
      key: 'includeInReport',
      render: (value: boolean) => (value ? t('common.yes') : t('common.no')),
      onCell: (record) => ({
        editing: isEditingParent(record),
        dataIndex: 'includeInReport',
        inputType: 'checkbox',
        record,
      } as any),
    },
    {
      title: t('marketing.actions'),
      key: 'actions',
      render: (_: unknown, record) => {
        const editing = isEditingParent(record);
        if (editing) {
          return (
            <Space>
              <Button
                type="primary"
                onClick={() => saveParent(record)}
              >
                {t('organizations.save')}
              </Button>
              <Button
                onClick={cancelParent}
              >
                {t('organizations.cancel')}
              </Button>
            </Space>
          );
        }
        return (
          <Typography.Link
            disabled={editingParentId !== null}
            onClick={() => editParent(record)}
          >
            {t('actions.edit')}
          </Typography.Link>
        );
      },
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(mainColumns, 'percentage-of-objects-table-columns');

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };


  const handleRowClick = (record: ObjectData) => {
    const key = record.id;
    setExpandedRowKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <>
      <div className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0" onClick={() => navigate(-1)}>
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>

      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.percentageOfObjects')}
          </span>
        </div>
        <Button icon={<PlusOutlined />} className="btn-primary" onClick={handleAdd}>
          {t('routes.add')}
        </Button>
      </div>

      <GeneralFilters count={totalCount} display={['city']} />

      <div className="mt-8">
        <div className="mb-4 flex justify-between">
          <div className="flex space-x-2">
            <ColumnSelector
              checkedList={checkedList}
              options={options}
              onChange={setCheckedList}
            />
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={t('common.deleteConfirm')}
                onConfirm={handleDeleteRows}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t('finance.delete')} ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>

        <Form form={form} component={false}>
          <Table
            rowKey="id"
            dataSource={paginatedData}
            columns={visibleColumns}
            rowSelection={rowSelection}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              rowExpandable: (record) => record.partners.length > 0,
              onExpand: (expanded, record) => {
                if (expanded) {
                  setExpandedRowKeys([...expandedRowKeys, record.id]);
                } else {
                  setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
                }
              },
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' },
            })}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              pageSizeOptions: ALL_PAGE_SIZES,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} из ${total} ${t('finance.records')}`,
              onChange: (page, size) =>
                updateSearchParams(searchParams, setSearchParams, {
                  page: String(page),
                  size: String(size),
                }),
            }}
            scroll={{ x: 'max-content' }}
          />
        </Form>
      </div>
    </>
  );
};

export default PercentageOfObjects;