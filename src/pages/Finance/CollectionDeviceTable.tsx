// components/Collection/CollectionDeviceTable.tsx
import React from 'react';
import { Table } from 'antd';
import { TFunction } from 'i18next';
import dayjs from 'dayjs';
import { EditOutlined } from '@ant-design/icons';
import { getCurrencyRender } from '@/utils/tableUnits';

type CashCollectionDevice = {
  id: number;
  deviceId: number;
  deviceName: string;
  deviceType: string;
  oldTookMoneyTime: Date;
  tookMoneyTime: Date;
  sumDevice: number;
  sumCoinDevice: number;
  sumPaperDevice: number;
  virtualSumDevice: number;
};

type Props = {
  deviceData: CashCollectionDevice[];
  editingRow: number | null;
  setEditingRow: (id: number | null) => void;
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    rowId: number,
    key: string
  ) => void;
  status: string;
  t: TFunction;
  loading: boolean;
};

const CollectionDeviceTable: React.FC<Props> = ({
  deviceData,
  editingRow,
  setEditingRow,
  handleDateChange,
  status,
  t,
  loading,
}) => {
  const columns = [
    {
      title: t('Имя устройства'),
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: t('Тип устройства'),
      dataIndex: 'deviceType',
      key: 'deviceType',
    },
    {
      title: t('Время сбора (старое)'),
      dataIndex: 'oldTookMoneyTime',
      key: 'oldTookMoneyTime',
      render: (text: string) => dayjs(text).format('DD.MM.YYYY HH:mm:ss'),
    },
    {
      title: t('Время сбора (новое)'),
      dataIndex: 'tookMoneyTime',
      key: 'tookMoneyTime',
      render: (_: unknown, record: CashCollectionDevice) => {
        const date = record.tookMoneyTime;
        const isEditable =
          editingRow === record.id && status !== t('tables.SENT');
        const formatted = date ? dayjs(date).format('YYYY-MM-DDTHH:mm') : '';

        return isEditable ? (
          <input
            type="datetime-local"
            value={formatted}
            onChange={e =>
              handleDateChange(e, record.deviceId, 'tookMoneyTime')
            }
            onBlur={() => setEditingRow(null)}
            autoFocus
            className="w-full px-2 py-1 border rounded-md"
          />
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => {
              if (status !== t('tables.SENT')) setEditingRow(record.id);
            }}
          >
            {dayjs(date).format('DD.MM.YYYY HH:mm:ss')}
          </div>
        );
      },
    },
    {
      title: t('Сумма'),
      dataIndex: 'sumDevice',
      key: 'sumDevice',
      render: getCurrencyRender(),
    },
    {
      title: t('Монеты'),
      dataIndex: 'sumCoinDevice',
      key: 'sumCoinDevice',
      render: getCurrencyRender(),
    },
    {
      title: t('Купюры'),
      dataIndex: 'sumPaperDevice',
      key: 'sumPaperDevice',
      render: getCurrencyRender(),
    },
    {
      title: t('Безналичная сумма'),
      dataIndex: 'virtualSumDevice',
      key: 'virtualSumDevice',
      render: getCurrencyRender(),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: CashCollectionDevice) => (
        <div
          className="text-primary02 cursor-pointer"
          onClick={() => {
            if (status !== t('tables.SENT')) setEditingRow(record.id);
          }}
        >
          <EditOutlined />
        </div>
      ),
    },
  ];

  return (
    <Table
      dataSource={deviceData}
      columns={columns}
      rowKey="id"
      pagination={false}
      loading={loading}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default CollectionDeviceTable;
