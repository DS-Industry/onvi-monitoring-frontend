import React, { useState } from 'react';
import { Table, Popconfirm, Typography, Button, DatePicker } from 'antd';
import { TFunction } from 'i18next';
import dayjs from 'dayjs';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
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
  const [editingValue, setEditingValue] = useState<string>(''); // new tookMoneyTime
  const [editingOldValue, setEditingOldValue] = useState<string>(''); // oldTookMoneyTime

  const startEditing = (record: CashCollectionDevice) => {
    setEditingRow(record.id);

    // ✅ Properly separate the two fields
    setEditingValue(
      record.tookMoneyTime
        ? dayjs(record.tookMoneyTime).format('YYYY-MM-DDTHH:mm:ss')
        : ''
    );

    setEditingOldValue(
      record.oldTookMoneyTime
        ? dayjs(record.oldTookMoneyTime).format('YYYY-MM-DDTHH:mm:ss')
        : ''
    );
  };

  const cancelEditing = () => {
    setEditingRow(null);
  };

  const saveEditing = (record: CashCollectionDevice) => {
    if (editingOldValue) {
      const fakeOldEvent = {
        target: { value: editingOldValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleDateChange(fakeOldEvent, record.deviceId, 'oldTookMoneyTime');
    }

    if (editingValue) {
      const fakeNewEvent = {
        target: { value: editingValue },
      } as React.ChangeEvent<HTMLInputElement>;
      handleDateChange(fakeNewEvent, record.deviceId, 'tookMoneyTime');
    }

    setEditingRow(null);
  };

  const columns = [
    {
      title: t('finance.deviceName'),
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: '10%',
    },
    {
      title: t('table.headers.deviceType'),
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: '10%',
    },
    {
      title: t('table.headers.oldMoneyTime'),
      dataIndex: 'oldTookMoneyTime',
      key: 'oldTookMoneyTime',
      width: '15%',
      render: (_: unknown, record: CashCollectionDevice) => {
        const isEditable =
          editingRow === record.id && status !== t('tables.SENT');

        return isEditable ? (
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="DD.MM.YYYY HH:mm:ss"
            value={
              editingOldValue && dayjs(editingOldValue).isValid()
                ? dayjs(editingOldValue)
                : null
            }
            onChange={momentObj => {
              setEditingOldValue(
                momentObj ? momentObj.format('YYYY-MM-DDTHH:mm:ss') : ''
              );
            }}
            className="w-full"
          />
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => {
              if (status !== t('tables.SENT')) startEditing(record);
            }}
          >
            {dayjs(record.oldTookMoneyTime).format('DD.MM.YYYY HH:mm:ss')}
          </div>
        );
      },
    },
    {
      title: t('table.headers.newMoneyTime'),
      dataIndex: 'tookMoneyTime',
      key: 'tookMoneyTime',
      width: '15%',
      render: (_: unknown, record: CashCollectionDevice) => {
        const isEditable =
          editingRow === record.id && status !== t('tables.SENT');

        return isEditable ? (
          <DatePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="DD.MM.YYYY HH:mm:ss"
            value={
              editingValue && dayjs(editingValue).isValid()
                ? dayjs(editingValue)
                : null
            }
            onChange={momentObj => {
              setEditingValue(
                momentObj ? momentObj.format('YYYY-MM-DDTHH:mm:ss') : ''
              );
            }}
            className="w-full"
          />
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => {
              if (status !== t('tables.SENT')) startEditing(record);
            }}
          >
            {dayjs(record.tookMoneyTime).format('DD.MM.YYYY HH:mm:ss')}
          </div>
        );
      },
    },
    {
      title: t('marketing.amount'),
      dataIndex: 'sumDevice',
      key: 'sumDevice',
      width: '10%',
      render: getCurrencyRender(),
    },
    {
      title: t('table.columns.coins'),
      dataIndex: 'sumCoinDevice',
      key: 'sumCoinDevice',
      width: '11%',
      render: getCurrencyRender(),
    },
    {
      title: t('table.columns.banknotes'),
      dataIndex: 'sumPaperDevice',
      key: 'sumPaperDevice',
      width: '11%',
      render: getCurrencyRender(),
    },
    {
      title: t('table.headers.cashlessSum'),
      dataIndex: 'virtualSumDevice',
      key: 'virtualSumDevice',
      width: '11%',
      render: getCurrencyRender(),
    },
    {
      title: '',
      key: 'actions',
      width: '10%',
      render: (_: unknown, record: CashCollectionDevice) => {
        if (editingRow === record.id && status !== t('tables.SENT')) {
          return (
            <span>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => saveEditing(record)}
                style={{ marginRight: 8, color: 'green' }}
              />
              <Popconfirm
                title={`${t('common.discardChanges')}?`}
                onConfirm={cancelEditing}
                okText={t('equipment.yes')}
                cancelText={t('equipment.no')}
              >
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  style={{ color: 'red' }}
                />
              </Popconfirm>
            </span>
          );
        }
        return (
          <Typography.Link
            disabled={editingRow !== null || status === t('tables.SENT')}
            onClick={() => startEditing(record)}
          >
            <EditOutlined />
          </Typography.Link>
        );
      },
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
