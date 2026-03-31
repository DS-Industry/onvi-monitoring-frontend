import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Descriptions, Divider, Table, Popconfirm } from 'antd';
import { ArrowLeftOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import dayjs from 'dayjs';
import DateTimeInput from '@/components/ui/Input/DateTimeInput';
import { usePermissions } from '@/hooks/useAuthStore';
import { Can } from '@/permissions/Can';
import { useToast } from '@/components/context/useContext';
import {
  getPoses,
  TechExpenseReportStatus,
  getTechExpenseReport,
  recalculateTechExpenseReport,
  sendTechExpenseReport,
  sendWarehouseTechExpenseReport,
  returnTechExpenseReport,
  deleteTechExpenseReport,
  TechExpenseReport,
} from '@/services/api/equipment';
import { getStatusTagRender } from '@/utils/tableUnits';

const ExpenseReportEdit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userPermissions = usePermissions();
  const { showToast } = useToast();
  const renderStatus = getStatusTagRender(t);
  const reportId = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

  const [showData, setShowData] = useState(true);
  const [reportData, setReportData] = useState<TechExpenseReport | null>(null);
  const [editedStartPeriod, setEditedStartPeriod] = useState<Date | null>(null);
  const [editedEndPeriod, setEditedEndPeriod] = useState<Date | null>(null);
  const [editedCarryingDocumentWarehouseAt, setEditedCarryingDocumentWarehouseAt] = useState<Date | null>(null);
  const [editedItems, setEditedItems] = useState<Map<number, { quantityWriteOff?: number; quantityAtEnd?: number }>>(new Map());

  const { data: fetchedReport, isLoading } = useSWR(
    reportId ? ['get-tech-expense-report', reportId] : null,
    () => getTechExpenseReport(reportId!),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (fetchedReport) {
      setReportData(fetchedReport);
      setEditedStartPeriod(fetchedReport.startPeriod);
      setEditedEndPeriod(fetchedReport.endPeriod);
      const initialCarryingDate = fetchedReport.carryingDocumentWarehouseAt ?? fetchedReport.endPeriod;
      setEditedCarryingDocumentWarehouseAt(initialCarryingDate);

      const newEditedItems = new Map();
      fetchedReport.items.forEach(item => {
        newEditedItems.set(item.id, {
          quantityAtEnd: item.quantityAtEnd ?? 0,
          quantityWriteOff: item.quantityWriteOff ?? 0,
        });
      });
      setEditedItems(newEditedItems);
    }
  }, [fetchedReport]);

  const { data: posData } = useSWR(
    ['get-pos'],
    () => getPoses({}),
    { revalidateOnFocus: false }
  );
  const poses = posData?.map(p => ({ name: p.name, value: p.id })) || [];

  const isEditable =
    reportData?.status === TechExpenseReportStatus.SAVED ||
    reportData?.status === TechExpenseReportStatus.CREATED;

  const isSent = reportData?.status === TechExpenseReportStatus.SENT;
  const canWarehouse = isSent && !reportData?.isWriteOffFromWarehouse;

  const handleStartPeriodChange = (date: dayjs.Dayjs | undefined) => {
    setEditedStartPeriod(date ? date.toDate() : null);
  };

  const handleEndPeriodChange = (date: dayjs.Dayjs | undefined) => {
    setEditedEndPeriod(date ? date.toDate() : null);
  };

  const handleCarryingDocumentWarehouseAtChange = (date: dayjs.Dayjs | undefined) => {
    setEditedCarryingDocumentWarehouseAt(date ? date.toDate() : null);
  };

  const handleItemChange = (
    id: number,
    field: 'quantityWriteOff' | 'quantityAtEnd',
    value: number,
    currentRecord: any
  ) => {
    const warehouseQty = currentRecord.quantityOnWarehouse;
    if (isNaN(value)) value = 0;
    const clampedValue = Math.min(warehouseQty, Math.max(0, value));

    setEditedItems(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id) || {};
      newMap.set(id, {
        ...existing,
        [field]: clampedValue,
      });
      return newMap;
    });
  };

  const buildRecalculateDto = () => {
    const itemUpdates = Array.from(editedItems.entries()).map(([id, values]) => ({
      id,
      ...values,
    }));
    return {
      startPeriod: editedStartPeriod ?? undefined,
      endPeriod: editedEndPeriod ?? undefined,
      carryingDocumentWarehouseAt: editedCarryingDocumentWarehouseAt ?? undefined,
      itemUpdates,
    };
  };

  const { trigger: recalcTrigger, isMutating: recalcLoading } = useSWRMutation(
    ['recalculate', reportId],
    () => recalculateTechExpenseReport(reportId!, buildRecalculateDto())
  );

  const { trigger: sendTrigger, isMutating: sendLoading } = useSWRMutation(
    ['send', reportId],
    () => sendTechExpenseReport(reportId!, buildRecalculateDto())
  );

  const { trigger: warehouseTrigger, isMutating: warehouseLoading } = useSWRMutation(
    ['warehouse', reportId],
    () => sendWarehouseTechExpenseReport(reportId!)
  );

  const { trigger: returnTrigger, isMutating: returnLoading } = useSWRMutation(
    ['return', reportId],
    () => returnTechExpenseReport(reportId!)
  );

  const { trigger: deleteTrigger, isMutating: deleteLoading } = useSWRMutation(
    ['delete', reportId],
    () => deleteTechExpenseReport(reportId!)
  );

  const handleRecalculate = async () => {
    try {
      const result = await recalcTrigger();
      if (result) {
        mutate(['get-tech-expense-report', reportId]);
        showToast(t('success.recordUpdated'), 'success');
      }
    } catch {
      showToast(t('analysis.ERROR'), 'error');
    }
  };

  const handleSend = async () => {
    try {
      const result = await sendTrigger();
      if (result) {
        mutate(['get-tech-expense-report', reportId]);
        showToast(t('finance.sentSuccessfully'), 'success');
      }
    } catch {
      showToast(t('errors.sendFailed'), 'error');
    }
  };

  const handleWarehouse = async () => {
    try {
      const result = await warehouseTrigger();
      if (result) {
        mutate(['get-tech-expense-report', reportId]);
        showToast(t('equipment.isWriteOffFromWarehouse'), 'success');
      }
    } catch {
      showToast(t('analysis.ERROR'), 'error');
    }
  };

  const handleReturn = async () => {
    try {
      const result = await returnTrigger();
      if (result) {
        mutate(['get-tech-expense-report', reportId]);
        showToast(t('finance.returnedSuccessfully'), 'success');
      }
    } catch {
      showToast(t('analysis.ERROR'), 'error');
    }
  };

  const columns = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('equipment.consumable'),
      dataIndex: 'techConsumablesName',
      key: 'techConsumablesName',
      render: (text: string) => text || '-',
    },
    {
      title: t('equipment.quantityAtStart'),
      dataIndex: 'quantityAtStart',
      key: 'quantityAtStart',
    },
    {
      title: t('equipment.quantityByReport'),
      dataIndex: 'quantityByReport',
      key: 'quantityByReport',
    },
    {
      title: t('equipment.quantityExpensesOnWarehouse'),
      dataIndex: 'quantityExpensesOnWarehouse',
      key: 'quantityExpensesOnWarehouse',
      render: (val?: number) => val ?? '-',
    },
    {
      title: t('equipment.quantityComingOnWarehouse'),
      dataIndex: 'quantityComingOnWarehouse',
      key: 'quantityComingOnWarehouse',
      render: (val?: number) => val ?? '-',
    },
    {
      title: t('equipment.calculationQuantityOnWarehouse'),
      dataIndex: 'calculationQuantityOnWarehouse',
      key: 'calculationQuantityOnWarehouse',
      render: (val?: number) => val ?? '-',
    },
    {
      title: t('equipment.quantityOnWarehouse'),
      dataIndex: 'quantityOnWarehouse',
      key: 'quantityOnWarehouse',
    },
    {
      title: t('equipment.quantityAtEnd'),
      dataIndex: 'quantityAtEnd',
      key: 'quantityAtEnd',
      render: (_: any, record: any) => {
        const edited = editedItems.get(record.id);
        const value = edited?.quantityAtEnd !== undefined ? edited.quantityAtEnd : (record.quantityAtEnd ?? 0);
        if (!isEditable) return value;
        return (
          <input
            type="number"
            className="w-24 border rounded px-2 py-1"
            value={value}
            min={0}
            max={record.quantityOnWarehouse}
            onChange={(e) => {
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = 0;
              val = Math.min(record.quantityOnWarehouse, Math.max(0, val));
              handleItemChange(record.id, 'quantityAtEnd', val, record);
            }}
          />
        );
      },
    },
    {
      title: t('equipment.quantityWriteOff'),
      dataIndex: 'quantityWriteOff',
      key: 'quantityWriteOff',
      render: (_: any, record: any) => {
        const edited = editedItems.get(record.id);
        const value = edited?.quantityWriteOff !== undefined ? edited.quantityWriteOff : (record.quantityWriteOff ?? 0);
        if (!isEditable) return value;
        return (
          <input
            type="number"
            className="w-24 border rounded px-2 py-1"
            value={value}
            min={0}
            max={record.quantityOnWarehouse}
            onChange={(e) => {
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = 0;
              val = Math.min(record.quantityOnWarehouse, Math.max(0, val));
              handleItemChange(record.id, 'quantityWriteOff', val, record);
            }}
          /> 
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>

      <div className="ml-12 md:ml-0 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.expenseReport')}
        </span>
      </div>

      <div className="flex justify-end">
        {reportData && (
          <Button
            icon={showData ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setShowData(!showData)}
          >
            {t('finance.add')}
          </Button>
        )}
      </div>

      {showData && reportData && (
        <>
          <Descriptions
            column={{ xs: 1, sm: 2, md: 3 }}
            labelStyle={{ fontWeight: 500 }}
            contentStyle={{ textAlign: 'right' }}
          >
            <Descriptions.Item label={t('analysis.posId')}>
              <span className="font-bold">
                {poses.find(p => p.value === reportData.posId)?.name || reportData.posId}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={t('finance.begin')}>
              {isEditable ? (
                <DateTimeInput
                  value={editedStartPeriod ? dayjs(editedStartPeriod) : undefined}
                  changeValue={handleStartPeriodChange}
                  classname="w-64"
                />
              ) : (
                <span className="font-bold">
                  {dayjs(reportData.startPeriod).format('DD.MM.YYYY HH:mm')}
                </span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label={t('finance.end')}>
              {isEditable ? (
                <DateTimeInput
                  value={editedEndPeriod ? dayjs(editedEndPeriod) : undefined}
                  changeValue={handleEndPeriodChange}
                  classname="w-64"
                />
              ) : (
                <span className="font-bold">
                  {dayjs(reportData.endPeriod).format('DD.MM.YYYY HH:mm')}
                </span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label={t('equipment.carryingDocumentWarehouseAt')}>
              {isEditable ? (
                <DateTimeInput
                  value={editedCarryingDocumentWarehouseAt ? dayjs(editedCarryingDocumentWarehouseAt) : undefined}
                  changeValue={handleCarryingDocumentWarehouseAtChange}
                  classname="w-64"
                />
              ) : (
                <span className="font-bold">
                  {reportData.carryingDocumentWarehouseAt
                    ? dayjs(reportData.carryingDocumentWarehouseAt).format('DD.MM.YYYY HH:mm')
                    : reportData.endPeriod
                      ? dayjs(reportData.endPeriod).format('DD.MM.YYYY HH:mm')
                      : '-'}
                </span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label={t('table.columns.status')}>
              <span className="font-bold">
                {renderStatus(t(`tables.${reportData.status}`))}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={t('equipment.isWriteOffFromWarehouse')}>
              <span className="font-bold">
                {reportData.isWriteOffFromWarehouse ? t('equipment.yes') : t('equipment.no')}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={t('table.columns.createdAt')}>
              <span className="font-bold">
                {dayjs(reportData.createdAt).format('DD.MM.YYYY HH:mm')}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={t('table.columns.updatedAt')}>
              <span className="font-bold">
                {dayjs(reportData.updatedAt).format('DD.MM.YYYY HH:mm')}
              </span>
            </Descriptions.Item>
          </Descriptions>

          <Divider />
        </>
      )}

      <Table
        rowKey="id"
        dataSource={reportData?.items || []}
        columns={columns}
        pagination={false}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
      />

      {reportData && (
        <div className="flex space-x-3 mt-6">
          <Button onClick={() => navigate(-1)}>{t('organizations.cancel')}</Button>

          <Can requiredPermissions={[{ action: 'manage', subject: 'Incident' }, { action: 'delete', subject: 'Incident' }]} userPermissions={userPermissions}>
            {allowed => allowed && isEditable && (
              <Popconfirm
                title={t('marketingLoyalty.confirmDelete')}
                description={t('finance.del')}
                onConfirm={async () => {
                  try {
                    await deleteTrigger();
                    navigate('/equipment/expense-report');
                    showToast(t('success.recordDeleted'), 'success');
                  } catch {
                    showToast(t('analysis.ERROR'), 'error');
                  }
                }}
                okText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                disabled={!isEditable}
              >
                <Button danger loading={deleteLoading}>
                  {t('actions.delete')}
                </Button>
              </Popconfirm>
            )}
          </Can>

          <Can requiredPermissions={[{ action: 'manage', subject: 'Incident' }, { action: 'update', subject: 'Incident' }]} userPermissions={userPermissions}>
            {allowed => allowed && isEditable && (
              <>
                <Button onClick={handleRecalculate} loading={recalcLoading} type="default">
                  {t('finance.recal')}
                </Button>
                <Button onClick={handleSend} loading={sendLoading} type="primary">
                  {t('finance.send')}
                </Button>
              </>
            )}
          </Can>

          <Can requiredPermissions={[{ action: 'manage', subject: 'Incident' }, { action: 'update', subject: 'Incident' }]} userPermissions={userPermissions}>
            {allowed => allowed && canWarehouse && (
              <>
                <Button onClick={handleWarehouse} loading={warehouseLoading} type="primary">
                  {t('equipment.sendToWarehouse')}
                </Button>
                <Button onClick={handleReturn} loading={returnLoading} type="default">
                  {t('finance.return')}
                </Button>
              </>
            )}
          </Can>
        </div>
      )}
    </div>
  );
};

export default ExpenseReportEdit;