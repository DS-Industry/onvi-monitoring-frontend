import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Table, Select, InputNumber, DatePicker, Button, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined } from '@ant-design/icons';

import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { ALL_PAGE_SIZES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { EngineHoursResponse, getEngineHours, updateDeviceTechParams } from '@/services/api/equipment';
import { formatHoursToTime } from '@/utils/timeFormatter';

const { Text } = Typography;

const EngineHours: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateStart = searchParams.get('dateStart') || dayjs().startOf('day').format('YYYY-MM-DDTHH:mm');
  const dateEnd = searchParams.get('dateEnd') || dayjs().endOf('day').format('YYYY-MM-DDTHH:mm');
  const placementId = searchParams.get('city');
  const posId = searchParams.get('posId');
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<EngineHoursResponse>>({});

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      dateStart,
      dateEnd,
    };
    if (placementId && placementId !== '*') params.placementId = Number(placementId);
    if (posId && posId !== '*') params.posId = Number(posId);
    return params;
  }, [dateStart, dateEnd, placementId, posId]);

  const swrKey = useMemo(() => ['engine-hours', queryParams], [queryParams]);

  const { data: tableData = [], isLoading, mutate } = useSWR(
    swrKey,
    () => getEngineHours(queryParams as any),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const startEditing = (record: EngineHoursResponse) => {
    setEditingRowId(record.deviceId);
    setEditValues({
      pumpVersion: record.pumpVersion,
      oilLimit: record.oilLimit,
      lastOilChangeDate: record.lastOilChangeDate,
      lastPumpChangeDate: record.lastPumpChangeDate,
    });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditValues({});
  };

  const saveEditing = async (record: EngineHoursResponse) => {
    const changes: any = {};
    
    if (editValues.pumpVersion !== undefined && editValues.pumpVersion !== record.pumpVersion)
      changes.pumpVersion = editValues.pumpVersion;

    if (editValues.oilLimit !== undefined && editValues.oilLimit !== record.oilLimit)
      changes.oilLimit = editValues.oilLimit;

    if (editValues.lastOilChangeDate !== undefined && editValues.lastOilChangeDate !== record.lastOilChangeDate)
      changes.lastOilChangeDate = editValues.lastOilChangeDate || null;

    if (editValues.lastPumpChangeDate !== undefined && editValues.lastPumpChangeDate !== record.lastPumpChangeDate)
      changes.lastPumpChangeDate = editValues.lastPumpChangeDate || null;

    if (Object.keys(changes).length === 0) {
      setEditingRowId(null);
      return;
    }

    try {
      await updateDeviceTechParams(record.deviceId, changes);
      mutate();
      setEditingRowId(null);
      setEditValues({});
    } catch (error) {
      console.error(error);
    }
  };

  const handlePumpVersionChange = (value: number) =>
    setEditValues(prev => ({ ...prev, pumpVersion: value }));

  const handleOilLimitChange = (value: number | null) =>
    setEditValues(prev => ({ ...prev, oilLimit: value ?? undefined }));

  const handleLastOilChangeDateChange = (date: dayjs.Dayjs | null) => {
    const value = date ? date.startOf('minute').toISOString() : null;
    setEditValues(prev => ({ ...prev, lastOilChangeDate: value }));
  };

  const handleLastPumpChangeDateChange = (date: dayjs.Dayjs | null) => {
    const value = date ? date.startOf('minute').toISOString() : null;
    setEditValues(prev => ({ ...prev, lastPumpChangeDate: value }));
  };

  const columns: ColumnsType<EngineHoursResponse> = [
    {
      title: t('equipment.device'),
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: t('equipment.pumpVersion'),
      dataIndex: 'pumpVersion',
      key: 'pumpVersion',
      render: (value: number, record: EngineHoursResponse) => {
        const isEditing = editingRowId === record.deviceId;
        return isEditing ? (
          <Select
            value={editValues.pumpVersion ?? value}
            onChange={handlePumpVersionChange}
            style={{ width: 100 }}
            options={[
              { label: '1', value: 1 },
              { label: '2', value: 2 },
            ]}
          />
        ) : (
          <Text>{value ?? '-'}</Text>
        );
      },
    },
    {
      title: t('equipment.oilLimit'),
      dataIndex: 'oilLimit',
      key: 'oilLimit',
      render: (value: number | null, record: EngineHoursResponse) => {
        const isEditing = editingRowId === record.deviceId;
        return isEditing ? (
          <InputNumber
            value={editValues.oilLimit ?? value ?? undefined}
            onChange={handleOilLimitChange}
            min={0}
            style={{ width: 100 }}
          />
        ) : (
          <Text>{value ?? '-'}</Text>
        );
      },
    },
    {
      title: t('equipment.pumpRunHours'),
      dataIndex: 'pumpRunHours',
      key: 'pumpRunHours',
      render: (value: number | null) => formatHoursToTime(value),
    },
    {
      title: t('equipment.oilRunHours'),
      dataIndex: 'oilRunHours',
      key: 'oilRunHours',
      render: (value: number | null) => formatHoursToTime(value),
    },
    {
      title: t('equipment.lastOilChange'),
      dataIndex: 'lastOilChangeDate',
      key: 'lastOilChangeDate',
      render: (value: string | null, record: EngineHoursResponse) => {
        const isEditing = editingRowId === record.deviceId;
        return isEditing ? (
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD.MM.YYYY HH:mm"
            value={editValues.lastOilChangeDate ? dayjs(editValues.lastOilChangeDate) : null}
            onChange={handleLastOilChangeDateChange}
            style={{ width: 200 }}
          />
        ) : (
          <Text>{value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '-'}</Text>
        );
      },
    },
    {
      title: t('equipment.lastPumpChange'),
      dataIndex: 'lastPumpChangeDate',
      key: 'lastPumpChangeDate',
      render: (value: string | null, record: EngineHoursResponse) => {
        const isEditing = editingRowId === record.deviceId;
        return isEditing ? (
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD.MM.YYYY HH:mm"
            value={editValues.lastPumpChangeDate ? dayjs(editValues.lastPumpChangeDate) : null}
            onChange={handleLastPumpChangeDateChange}
            style={{ width: 200 }}
          />
        ) : (
          <Text>{value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '-'}</Text>
        );
      },
    },
    {
      title: t('equipment.actions'),
      key: 'actions',
      width: 250,
      render: (_: unknown, record: EngineHoursResponse) => {
        if (editingRowId === record.deviceId) {
          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="primary" size="small" onClick={() => saveEditing(record)}>
                {t('common.save')}
              </Button>
              <Button size="small" onClick={cancelEditing}>
                {t('common.cancel')}
              </Button>
            </div>
          );
        }
        return (
          <Typography.Link onClick={() => startEditing(record)}>
            <EditOutlined />
          </Typography.Link>
        );
      },
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } = useColumnSelector(
    columns,
    'engine-hours-table-columns'
  );

  const handlePageChange = (page: number, size: number) => {
    updateSearchParams(searchParams, setSearchParams, {
      page: String(page),
      size: String(size),
    });
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.engineHours')}
          </span>
        </div>
      </div>

      <GeneralFilters
        display={['city', 'pos', 'dateTime', 'reset', 'count']}
        count={tableData.length}
      />

      <div className="mt-8">
        <ColumnSelector checkedList={checkedList} options={options} onChange={setCheckedList} />
        <Table
          rowKey="deviceId"
          dataSource={tableData}
          columns={visibleColumns}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: tableData.length,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} ${t('equipment.of')} ${total}`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );
};

export default EngineHours;