import { useSearchParams } from 'react-router-dom';

// utils
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  GET_DOCUMENT_RESPONSE,
  WarehouseDocumentType,
  getDocument,
  getNomenclature,
} from '@/services/api/warehouse';

// components
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Button,
  Select,
  DatePicker,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import WarehouseFilter from '@/components/ui/Filter/WarehouseFilter';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

const { Option } = Select;

type Detail = GET_DOCUMENT_RESPONSE['details'][0]['props'];

const EditableCell: React.FC<{
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'select';
  record: Detail;
  index: number;
  children: React.ReactNode;
  options?: { value: number; label: string }[];
}> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  options,
  ...restProps
}) => {
  let inputNode;
  if (inputType === 'number') {
    inputNode = <InputNumber min={1} />;
  } else if (inputType === 'select') {
    inputNode = (
      <Select placeholder="Select nomenclature">
        {options?.map(opt => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>
    );
  } else {
    inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: dataIndex === 'nomenclatureId',
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default function DocumentsCreation() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation();

  const documentType = searchParams.get('document');
  const warehouseId = searchParams.get('warehouseId')
    ? Number(searchParams.get('warehouseId'))
    : undefined;
  const organizationId = searchParams.get('organizationId')
    ? Number(searchParams.get('organizationId'))
    : undefined;

  const [noOverhead, setNoOverHead] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return dayjs().toDate().toISOString().split('T')[0];
  });

  const { data: document, isLoading } = useSWR(
    [`get-document-view`],
    () => getDocument(Number(searchParams.get('documentId'))),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: nomenclatureData, mutate } = useSWR(
    organizationId ? ['get-inventory', organizationId] : null,
    () => getNomenclature(organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const nomenclatureOptions = [
    { value: 3, label: 'Nomenclature A' },
    { value: 6, label: 'Nomenclature B' },
    { value: 7, label: 'Nomenclature C' },
  ];

  const [form] = Form.useForm();
  const [data, setData] = useState<
    GET_DOCUMENT_RESPONSE['details'][0]['props'][]
  >([]);
  const [editingKey, setEditingKey] = useState<number | ''>('');

  useEffect(() => {
    if (document) {
      setData(document.details.map(d => d.props));
    }
  }, [document]);

  const isEditing = (record: Detail) => record.id === editingKey;

  const edit = (
    record: Partial<Detail> & {
      id: number;
    }
  ) => {
    form.setFieldsValue({
      nomenclatureId: '',
      quantity: 1,
      comment: '',
      ...record,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id: number) => {
    try {
      const row = (await form.validateFields()) as Detail;
      const newData = [...data];
      const index = newData.findIndex(item => id === item.id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = (id: number) => {
    setData(data.filter(item => item.id !== id));
  };

  const handleAdd = () => {
    if (!document) return;

    const newRow: Detail = {
      id: Date.now(),
      warehouseDocumentId: document.document.props.id,
      quantity: 1,
      comment: '',
      nomenclatureId: 0,
    };
    setData([...data, newRow]);
    edit(newRow);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!document) return <div>No document found</div>;

  const columns = [
    {
      title: 'Document ID',
      dataIndex: 'warehouseDocumentId',
      width: '12%',
      editable: false,
    },
    {
      title: 'Responsible',
      dataIndex: 'responsibleName',
      render: () => document.document.props.responsibleName ?? '',
      width: '15%',
      editable: false,
    },
    {
      title: 'Nomenclature',
      dataIndex: 'nomenclatureId',
      width: '20%',
      editable: true,
      render: (value: number) =>
        nomenclatureData?.map(n => n.props).find(opt => opt.id === value)
          ?.id || <span style={{ color: '#aaa' }}>Not selected</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: '10%',
      editable: true,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      width: '20%',
      editable: true,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_: any, record: Detail) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a onClick={() => save(record.id)} style={{ marginRight: 8 }}>
              Save
            </a>
            <Popconfirm title="Cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <a
              onClick={editingKey !== '' ? undefined : () => edit(record)}
              style={{
                marginRight: 8,
                pointerEvents: editingKey !== '' ? 'none' : 'auto',
                color: editingKey !== '' ? 'gray' : 'blue',
                cursor: editingKey !== '' ? 'not-allowed' : 'pointer',
              }}
            >
              Edit
            </a>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.id)}
            >
              <a>Delete</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col =>
    col.editable
      ? {
          ...col,
          onCell: (record: Detail) => ({
            record,
            inputType:
              col.dataIndex === 'quantity'
                ? 'number'
                : col.dataIndex === 'nomenclatureId'
                  ? 'select'
                  : 'text',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
            options: nomenclatureData?.map(n => n.props),
          }),
        }
      : col
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-y-4 py-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex">
            <div className="mr-10 text-text01 font-normal text-sm">
              <div>{t('warehouse.no')}</div>
              <div>{t('warehouse.overhead')}</div>
            </div>
            <Input
              type={''}
              value={noOverhead}
              changeValue={e => setNoOverHead(e.target.value)}
              disabled={true}
            />
          </div>
          <div className="flex">
            <div className="flex mt-3 text-text01 font-normal text-sm mx-2">
              {t('warehouse.from')}
            </div>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(date: Dayjs | null) =>
                setSelectedDate(date ? date.toISOString() : '')
              }
            />
          </div>
        </div>
        <div className="flex flex-col space-y-6">
          <div className="flex space-x-2">
            <div className="flex items-center justify-start sm:justify-center sm:w-64 text-text01 font-normal text-sm">
              {documentType === WarehouseDocumentType.MOVING
                ? t('warehouse.warehouseSend')
                : t('warehouse.ware')}
            </div>
            <WarehouseFilter
              onSelect={val => {
                updateSearchParams(searchParams, setSearchParams, {
                  organizationId: val?.props.organizationId,
                  warehouseId: val?.props.id,
                  page: DEFAULT_PAGE,
                });
              }}
            />
          </div>
        </div>
      </div>
      <Form form={form} component={false}>
        <Button
          onClick={handleAdd}
          type="primary"
          style={{ marginBottom: 16 }}
          disabled={editingKey !== ''}
        >
          Add Row
        </Button>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns as any}
          rowClassName="editable-row"
          pagination={false}
          rowKey="id"
        />
      </Form>
    </>
  );
}
