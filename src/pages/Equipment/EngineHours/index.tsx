import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Table, Select, InputNumber, DatePicker, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined } from '@ant-design/icons';

import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import CityFilterMulti from '@/components/ui/Filter/CityFilterMulti';
import PosFilterMulti from '@/components/ui/Filter/PosFilterMulti';
import ExcessFilter from '@/components/ui/Filter/ExcessFilter';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { updateSearchParams, parseIdsParam } from '@/utils/searchParamsUtils';
import { ALL_PAGE_SIZES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { EExcessType, EngineHoursResponse, getEngineHours, updateDeviceTechParams } from '@/services/api/equipment';
import { formatHoursToTime } from '@/utils/timeFormatter';

const { Text } = Typography;

type EditableField = 'pumpVersion' | 'oilLimit' | 'lastOilChangeDate' | 'lastPumpChangeDate';

const EngineHours: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateStart = searchParams.get('dateStart') || dayjs().startOf('day').format('YYYY-MM-DDTHH:mm');
  const dateEnd = searchParams.get('dateEnd') || dayjs().endOf('day').format('YYYY-MM-DDTHH:mm');
  const placementIds = useMemo(() => parseIdsParam(searchParams, 'cityIds'), [searchParams.get('cityIds')]);
  const posIds = useMemo(() => parseIdsParam(searchParams, 'posIds'), [searchParams.get('posIds')]);
  const excess = searchParams.get('excess') || EExcessType.ALL;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const [editingCell, setEditingCell] = useState<{ deviceId: number; field: EditableField } | null>(null);
  const [editCellValue, setEditCellValue] = useState<any>(null);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | number[] | undefined> = {
      dateStart,
      dateEnd,
    };
    if (placementIds.length) params.placementIds = placementIds;
    if (posIds.length) params.posIds = posIds;
    if (excess && excess !== EExcessType.ALL) params.excess = excess;
    return params;
  }, [dateStart, dateEnd, placementIds, posIds, excess]);

  const swrKey = useMemo(() => ['engine-hours', queryParams], [queryParams]);

  const { data: tableData = [], isLoading, mutate } = useSWR(
    swrKey,
    () => getEngineHours(queryParams as any),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const startEditing = (record: EngineHoursResponse, field: EditableField) => {
    setEditingCell({ deviceId: record.deviceId, field });
    setEditCellValue(record[field]);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditCellValue(null);
  };

  const saveEditing = async (record: EngineHoursResponse, field: EditableField, newValue: any) => {
    if (newValue === record[field]) {
      cancelEditing();
      return;
    }
    try {
      await updateDeviceTechParams(record.deviceId, { [field]: newValue });
      mutate();
    } catch (error) {
      console.error(error);
    } finally {
      cancelEditing();
    }
  };

  // Обработчики изменений
  const handlePumpVersionChange = (value: number) => {
    setEditCellValue(value);
    if (editingCell) {
      const record = tableData.find(r => r.deviceId === editingCell.deviceId);
      if (record) saveEditing(record, 'pumpVersion', value);
    }
  };

  const handleOilLimitChange = (value: number | null) => {
    setEditCellValue(value);
  };

  const handleOilLimitBlur = () => {
    if (editingCell) {
      const record = tableData.find(r => r.deviceId === editingCell.deviceId);
      if (record) saveEditing(record, 'oilLimit', editCellValue);
    }
  };

  const handleDateChange = (field: EditableField) => (date: dayjs.Dayjs | null) => {
    const value = date ? date.startOf('minute').toISOString() : null;
    setEditCellValue(value);
    if (editingCell) {
      const record = tableData.find(r => r.deviceId === editingCell.deviceId);
      if (record) saveEditing(record, field, value);
    }
  };

  const columns: ColumnsType<EngineHoursResponse> = [
    {
      title: t('equipment.carWash'),
      dataIndex: 'posName',
      key: 'posName',
    },
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
        const isEditing = editingCell?.deviceId === record.deviceId && editingCell?.field === 'pumpVersion';
        return isEditing ? (
          <Select
            value={editCellValue ?? value}
            onChange={handlePumpVersionChange}
            style={{ width: 100 }}
            options={[
              { label: '1', value: 1 },
              { label: '2', value: 2 },
            ]}
            autoFocus
          />
        ) : (
          <div
            onClick={() => startEditing(record, 'pumpVersion')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <Text>{value ?? '-'}</Text>
            <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
          </div>
        );
      },
    },
    {
      title: t('equipment.oilLimit'),
      dataIndex: 'oilLimit',
      key: 'oilLimit',
      render: (value: number | null, record: EngineHoursResponse) => {
        const isEditing = editingCell?.deviceId === record.deviceId && editingCell?.field === 'oilLimit';
        return isEditing ? (
          <InputNumber
            value={editCellValue ?? value ?? undefined}
            onChange={handleOilLimitChange}
            onBlur={handleOilLimitBlur}
            onPressEnter={handleOilLimitBlur}
            min={0}
            style={{ width: 100 }}
            autoFocus
          />
        ) : (
          <div
            onClick={() => startEditing(record, 'oilLimit')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <Text>{value ?? '-'}</Text>
            <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
          </div>
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
      render: (value: number | null, record: EngineHoursResponse) => {
        const isOverLimit =
          record.oilRunHours != null &&
          record.oilLimit != null &&
          record.oilRunHours > record.oilLimit;

        return (
          <div style={{ color: isOverLimit ? 'red' : '' }}>
            {formatHoursToTime(value)}
          </div>
        );
      },
    },
    {
      title: t('equipment.oilRunHoursPump'),
      dataIndex: 'oilRunHoursPump',
      key: 'oilRunHoursPump',
      render: (value: number | null) => formatHoursToTime(value),
    },
    {
      title: t('equipment.lastOilChange'),
      dataIndex: 'lastOilChangeDate',
      key: 'lastOilChangeDate',
      render: (value: string | null, record: EngineHoursResponse) => {
        const isEditing = editingCell?.deviceId === record.deviceId && editingCell?.field === 'lastOilChangeDate';
        return isEditing ? (
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD.MM.YYYY HH:mm"
            value={editCellValue ? dayjs(editCellValue) : null}
            onChange={handleDateChange('lastOilChangeDate')}
            style={{ width: 200 }}
            autoFocus
          />
        ) : (
          <div
            onClick={() => startEditing(record, 'lastOilChangeDate')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <Text>{value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '-'}</Text>
            <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
          </div>
        );
      },
    },
    {
      title: t('equipment.lastPumpChange'),
      dataIndex: 'lastPumpChangeDate',
      key: 'lastPumpChangeDate',
      render: (value: string | null, record: EngineHoursResponse) => {
        const isEditing = editingCell?.deviceId === record.deviceId && editingCell?.field === 'lastPumpChangeDate';
        return isEditing ? (
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD.MM.YYYY HH:mm"
            value={editCellValue ? dayjs(editCellValue) : null}
            onChange={handleDateChange('lastPumpChangeDate')}
            style={{ width: 200 }}
            autoFocus
          />
        ) : (
          <div
            onClick={() => startEditing(record, 'lastPumpChangeDate')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <Text>{value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '-'}</Text>
            <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
          </div>
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
        display={['dateTime', 'reset', 'count']}
        count={tableData.length}
      >
        <CityFilterMulti />
        <PosFilterMulti />
        <ExcessFilter />
      </GeneralFilters>

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