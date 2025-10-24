import React from 'react';
import { InputNumber, InputNumberProps, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { TFunction } from 'i18next';
import { formatNumber, getCurrencyRender } from '@/utils/tableUnits';

type TableRow = {
  id: number;
  typeName: string;
  sumPaperDeviceType: number;
  sumCoinDeviceType: number;
  sumFactDeviceType: number;
  shortageDeviceType: number;
  virtualSumDeviceType: number;
};

type EditableCellProps = {
  editable?: boolean;
  dataIndex: string;
  record: TableRow;
  handleInputChange?: (id: number, key: string, value: number) => void;
  children: React.ReactNode;
};

const EditableCell: React.FC<EditableCellProps> = ({
  editable,
  dataIndex,
  record,
  handleInputChange,
  children,
}) => {
  if (!record || !dataIndex) {
    return <td>{children}</td>;
  }

  const value = record[dataIndex as keyof typeof record] as number;

  const onChange: InputNumberProps['onChange'] = val => {
    if (handleInputChange) {
      handleInputChange(record.id, dataIndex, val as number);
    }
  };

  if (!editable) return <div>{children}</div>;

  return (
    <td>
      <InputNumber
        value={value}
        onChange={onChange}
        min={0}
        style={{ width: '100%' }}
      />
    </td>
  );
};

type Props = {
  tableData: TableRow[];
  status: string;
  t: TFunction;
  handleTableChange: (id: number, key: string, value: number) => void;
  loading: boolean;
};

const CashCollectionDeviceTypeTable: React.FC<Props> = ({
  tableData,
  status,
  t,
  handleTableChange,
  loading,
}) => {
  const getColumns = () => [
    {
      title: t('table.columns.type'),
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: t('table.columns.banknotes'),
      dataIndex: 'sumPaperDeviceType',
      key: 'sumPaperDeviceType',
      editable: status !== t('tables.SENT'),
    },
    {
      title: t('table.columns.coins'),
      dataIndex: 'sumCoinDeviceType',
      key: 'sumCoinDeviceType',
      editable: status !== t('tables.SENT'),
    },
    {
      title: t('table.columns.totalSum'),
      dataIndex: 'sumFactDeviceType',
      key: 'sumFactDeviceType',
      render: getCurrencyRender(),
    },
    {
      title: t('finance.short'),
      dataIndex: 'shortageDeviceType',
      key: 'shortageDeviceType',
      render: (val: number) => (
        <div className={'text-errorFill'}>{`${formatNumber(val)} ₽`}</div>
      ),
    },
    {
      title: t('finance.cash'),
      dataIndex: 'virtualSumDeviceType',
      key: 'virtualSumDeviceType',
      render: getCurrencyRender(),
    },
  ];

  return (
    <Table
      dataSource={tableData}
      columns={
        getColumns().map(col =>
          col.editable
            ? {
                ...col,
                onCell: (record: TableRow) => ({
                  record,
                  editable: true,
                  dataIndex: col.dataIndex,
                  handleInputChange: handleTableChange,
                }),
              }
            : col
        ) as ColumnsType<TableRow>
      }
      rowKey="id"
      pagination={false}
      loading={loading}
      scroll={{ x: 'max-content' }}
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      summary={() => {
        const totalSumFact = tableData.reduce(
          (acc, item) => acc + (item.sumFactDeviceType || 0),
          0
        );
        const totalShortage = tableData.reduce(
          (acc, item) => acc + (item.shortageDeviceType || 0),
          0
        );
        const totalVirtual = tableData.reduce(
          (acc, item) => acc + (item.virtualSumDeviceType || 0),
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
              <Table.Summary.Cell index={3}>
                <strong>{`${totalSumFact} ₽`}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <strong>{`${totalShortage} ₽`}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <strong>{`${totalVirtual} ₽`}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        );
      }}
    />
  );
};

export default CashCollectionDeviceTypeTable;
