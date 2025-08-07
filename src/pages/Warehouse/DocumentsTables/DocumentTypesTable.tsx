import React from 'react';
import { Table, Input, Select, Button, Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getOrganization } from '@/services/api/organization';
import {
  getInventoryItems,
  getNomenclature,
  WarehouseDocumentType,
} from '@/services/api/warehouse';
import { useSearchParams } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table';
import { JSX } from 'react/jsx-runtime';
import { t } from 'i18next';

const { Option } = Select;

interface TableRow {
  id: number;
  check: boolean;
  responsibleId: number;
  responsibleName: string;
  nomenclatureId: number;
  quantity: number;
  comment: string;
  oldQuantity?: number;
  deviation?: number;
  [key: string]: any;
}

type Props = {
  tableData: TableRow[];
  setTableData: React.Dispatch<React.SetStateAction<TableRow[]>>;
  addRow?: () => void;
  addProduct?: () => void;
  showDocument?: boolean;
  documentName?: string;
  documentTime?: string;
  deleteRow?: () => void;
  sortAscending?: () => void;
  sortDescending?: () => void;
};

interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: 'text' | 'number' | 'select' | 'checkbox';
  record: TableRow;
  index: number;
  children: React.ReactNode;
  options?: { label: string; value: number }[];
  onChange: (
    id: number,
    dataIndex: string,
    value: string | boolean | number
  ) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  children,
  options,
  onChange,
  ...restProps
}) => {
  let inputNode: React.ReactNode;
  const value =
    record?.[dataIndex] ??
    (inputType === 'checkbox' ? false : inputType === 'number' ? 0 : '');

  switch (inputType) {
    case 'number':
      inputNode = (
        <Input
          type="number"
          value={value}
          onChange={e => onChange(record.id, dataIndex, e.target.value)}
        />
      );
      break;
    case 'select':
      inputNode = (
        <Select
          value={value}
          onChange={value => onChange(record.id, dataIndex, value)}
          placeholder={`Select ${title}`}
          style={{ width: '100%' }}
        >
          <Option value={0}>{t('warehouse.notSel')}</Option>
          {options?.map(opt => (
            <Option value={opt.value} key={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      );
      break;
    case 'checkbox':
      inputNode = (
        <input
          type="checkbox"
          checked={value}
          onChange={() => onChange(record.id, dataIndex, !value)}
          style={{ width: 18, height: 18 }}
        />
      );
      break;
    default:
      inputNode = (
        <Input
          value={value}
          onChange={e => onChange(record.id, dataIndex, e.target.value)}
        />
      );
      break;
  }

  return <td {...restProps}>{editing ? inputNode : children}</td>;
};

const DocumentTypesTable: React.FC<Props> = ({
  tableData,
  setTableData,
  addRow,
  addProduct,
  deleteRow,
  sortAscending,
  sortDescending,
}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const city = Number(searchParams.get('city')) || undefined;
  const documentType = searchParams.get('document');
  const warehouseId = searchParams.get('warehouseId');

  const { data: organizationData } = useSWR([`get-org`], () =>
    getOrganization({
      placementId: city,
    })
  );
  const organizations =
    organizationData?.map(item => ({ label: item.name, value: item.id })) || [];

  const { data: inventoryItemData } = useSWR(
    warehouseId !== null && !isNaN(Number(warehouseId))
      ? [`get-inventory-items`]
      : null,
    () =>
      getInventoryItems(Number(warehouseId)).then(res => {
        return res.map(item => ({
          nomenclatureId: item.nomenclatureId,
          quantity: item.quantity,
        }));
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: nomenclatureData } = useSWR(
    organizations ? [`get-inventory`] : null,
    () => getNomenclature(organizations[0]?.value),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const nomenclatures =
    nomenclatureData?.map(item => ({
      label: item.props.name,
      value: item.props.id,
    })) || [];

  const handleChange = (
    id: number,
    dataIndex: string,
    value: string | number | boolean
  ) => {
    setTableData(prevData =>
      prevData?.map(item => {
        if (item.id === id) {
          if ('oldQuantity' in item && 'deviation' in item) {
            return {
              ...item,
              [dataIndex]: value,
              oldQuantity: inventoryItemData?.find(
                q => q.nomenclatureId === item.nomenclatureId
              )?.quantity
                ? inventoryItemData.find(
                    q => q.nomenclatureId === item.nomenclatureId
                  )?.quantity
                : 0,
              deviation:
                dataIndex === 'quantity' || dataIndex === 'oldQuantity'
                  ? (dataIndex === 'quantity' ? Number(value) : item.quantity) -
                    (dataIndex === 'oldQuantity'
                      ? Number(value)
                      : (item.oldQuantity ?? 0))
                  : item.deviation,
            };
          }
          return { ...item, [dataIndex]: value };
        }
        return item;
      })
    );
  };

  const baseColumns = [
    {
      title: '',
      dataIndex: 'check',
      key: 'check',
      width: 50,
      onCell: (record: TableRow) => ({
        record,
        inputType: 'checkbox',
        dataIndex: 'check',
        title: '',
        editing: true,
        onChange: handleChange,
      }),
      render: (_: unknown, record: TableRow) => (
        <input
          type="checkbox"
          checked={record.check}
          onChange={() => handleChange(record.id, 'check', !record.check)}
          style={{ width: 18, height: 18 }}
        />
      ),
    },
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Ответственный',
      dataIndex: 'responsibleName',
      key: 'responsibleName',
      width: 150,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Номенклатура',
      dataIndex: 'nomenclatureId',
      key: 'nomenclatureId',
      width: 240,
      onCell: (record: TableRow) => ({
        record,
        inputType: 'select',
        dataIndex: 'nomenclatureId',
        title: 'Номенклатура',
        editing: true,
        options: nomenclatures,
        onChange: handleChange,
      }),
      render: (value: number) => {
        const found = nomenclatures.find(n => n.value === value);
        return found ? found.label : t('warehouse.notSel');
      },
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      onCell: (record: TableRow) => ({
        record,
        inputType: 'number',
        dataIndex: 'quantity',
        title: 'Кол-во',
        editing: true,
        onChange: handleChange,
      }),
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      onCell: (record: TableRow) => ({
        record,
        inputType: 'text',
        dataIndex: 'comment',
        title: 'Комментарий',
        editing: true,
        onChange: handleChange,
      }),
    },
  ];

  const inventoryColumns = [
    {
      title: 'Кол-во учет',
      dataIndex: 'oldQuantity',
      key: 'oldQuantity',
      width: 120,
      onCell: (record: TableRow) => ({
        record,
        inputType: 'number',
        dataIndex: 'oldQuantity',
        title: 'Кол-во учет',
        editing: false,
      }),
      render: (value: string) => <Input value={value} disabled />,
    },
    {
      title: 'Отклонение',
      dataIndex: 'deviation',
      key: 'deviation',
      width: 120,
      onCell: (record: TableRow) => ({
        record,
        inputType: 'number',
        dataIndex: 'deviation',
        title: 'Отклонение',
        editing: false,
      }),
      render: (value: string) => <Input value={value} disabled />,
    },
  ];

  const columns = (
    documentType === WarehouseDocumentType.INVENTORY
      ? [...baseColumns, ...inventoryColumns]
      : baseColumns
  ) as ColumnsType<TableRow>;

  return (
    <div className="py-6 bg-white rounded-lg font-sans">
      <Card>
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={addProduct}>{t('roles.addPro')}</Button>
            <Button onClick={addRow}>{t('routes.add')}</Button>
            <Button onClick={deleteRow} danger>
              {t('marketing.delete')}
            </Button>
          </div>

          <div className="flex gap-2 justify-start lg:justify-end">
            <Button onClick={sortAscending} icon={<ArrowUpOutlined />} />
            <Button onClick={sortDescending} icon={<ArrowDownOutlined />} />
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <Table
            bordered
            dataSource={tableData}
            columns={columns}
            rowKey="id"
            pagination={false}
            components={{
              body: {
                cell: EditableCell,
              },
              header: {
                cell: (
                  props: JSX.IntrinsicAttributes &
                    React.ClassAttributes<HTMLTableHeaderCellElement> &
                    React.ThHTMLAttributes<HTMLTableHeaderCellElement>
                ) => (
                  <th
                    {...props}
                    style={{
                      backgroundColor: '#E4F0FF',
                      fontWeight: 'bold',
                      paddingTop: '30px',
                      paddingBottom: '30px',
                      textAlign: 'start',
                      borderRadius: '0px',
                    }}
                    className="border-b border-x-2 border-background02 bg-background06 px-2.5 text-center text-sm font-semibold text-text01 uppercase tracking-wider"
                  />
                ),
              },
            }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default DocumentTypesTable;
