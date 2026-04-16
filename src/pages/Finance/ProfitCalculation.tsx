import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Form,
  InputNumber,
  Dropdown,
  Space,
} from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, ALL_PAGE_SIZES } from '@/utils/constants';
import { getCurrencyRender } from '@/utils/tableUnits';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { useToast } from '@/components/context/useContext';
import useSWR from 'swr';
import {
  createPosPartnerReport,
  getPosCalculations,
  getPosPartnerReports,
  PosCalculationResponse,
  PosPartnerReportResponse,
  updatePosPartnerReport,
} from '@/services/api/finance';
import { getPresignedDownloadUrl, uploadFileWithPresignedUrl } from '@/services/api/s3';
import CreateProfitReportDrawer from './components/CreateProfitReportDrawer';

interface PartnerDetail {
  partnerId: number;
  partnerName: string;
  share: number;
  dividendSum: number;
  dividendMonth: Date;
}

interface FileInfo {
  name: string;
  key: string;
}

interface ProfitItem {
  id: number;
  posCalculationId: number;
  billingMonth: Date;
  month: string;
  city: string;
  carWashName: string;
  revenue: number;
  expense: number;
  profit: number;
  profitPercent: number;
  profitabilityPercent: number;
  file?: FileInfo;
  partners?: PartnerDetail[];
}

const ProfitCalculation: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const placementId = Number(searchParams.get('city')) || undefined;
  const posId = Number(searchParams.get('posId')) || undefined;
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');
  const parsedDateStart = dateStart ? dayjs(dateStart) : null;
  const parsedDateEnd = dateEnd ? dayjs(dateEnd) : null;
  const requestDateStart =
    parsedDateStart && parsedDateStart.isValid()
      ? parsedDateStart.format('YYYY-MM-DD')
      : undefined;
  const requestDateEnd =
    parsedDateEnd && parsedDateEnd.isValid()
      ? parsedDateEnd.format('YYYY-MM-DD')
      : undefined;

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingRevenue, setEditingRevenue] = useState<number>(0);
  const [editingExpense, setEditingExpense] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [uploadingRowId, setUploadingRowId] = useState<number | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [form] = Form.useForm();

  const { data: posCalculations = [] } = useSWR(
    ['get-pos-calculations-all'],
    () => getPosCalculations(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const selectedPosCalculationId = useMemo(() => {
    if (!posId) return undefined;
    const matchedPosCalculation = posCalculations.find(item => item.pos.id === posId);
    return matchedPosCalculation?.posCalculationId;
  }, [posCalculations, posId]);

  const reportFilters = useMemo(
    () => ({
      dateStart,
      dateEnd,
      placementId,
      selectedPosCalculationId,
    }),
    [dateStart, dateEnd, placementId, selectedPosCalculationId]
  );

  const { data: allProfitReports = [], isLoading, mutate: mutateReports } = useSWR(
    ['get-pos-partner-reports', reportFilters],
    async () =>
      getPosPartnerReports({
        dateStart: requestDateStart,
        dateEnd: requestDateEnd,
        placementId,
        posCalculationId: selectedPosCalculationId,
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    }
  );

  const posOptions = posCalculations.map((item: PosCalculationResponse) => ({
    label: `${item.region} - ${item.pos.name}`,
    value: item.posCalculationId,
  }));

  const normalizedData = useMemo<ProfitItem[]>(() => {
    return allProfitReports.map((report: PosPartnerReportResponse) => ({
      id: report.id,
      posCalculationId: report.posCalculationId,
      billingMonth: report.billingMonth,
      month: dayjs(report.billingMonth).format('MMMM YYYY'),
      city: report.region,
      carWashName: report.pos.name,
      revenue: report.revenue,
      expense: report.expenditure,
      profit: report.profit,
      profitPercent: report.percentReturnAssets,
      profitabilityPercent: report.percentProfitability,
      file: report.reportFileKey
        ? {
          key: report.reportFileKey,
          name: report.reportFileKey.split('/').pop() || report.reportFileKey,
        }
        : undefined,
      partners: (report.meta || []).map(partner => ({
        partnerId: partner.partnerId,
        partnerName: partner.fioPartner,
        share: partner.percentPartner,
        dividendSum: partner.sumPartner,
        dividendMonth: new Date(report.billingMonth),
      })),
    }));
  }, [allProfitReports]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return normalizedData.slice(start, start + pageSize);
  }, [normalizedData, currentPage, pageSize]);

  const totalCount = normalizedData.length;
  const currencyRender = getCurrencyRender();
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const handleFileUpload = async (record: ProfitItem, file: File) => {
    setUploadingRowId(record.id);
    try {
      const key = `partner-report/${record.posCalculationId}/${Date.now()}-${file.name}`;
      const uploadedKey = await uploadFileWithPresignedUrl(file, key);

      await updatePosPartnerReport({
        id: record.id,
        reportFileKey: uploadedKey,
      });

      await mutateReports();
      showToast(t('success.fileUploaded'), 'success');
    } catch (error) {
      console.error('Error uploading report file:', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setUploadingRowId(null);
    }
  };

  const handleFileDownload = async (file: FileInfo) => {
    try {
      const { url } = await getPresignedDownloadUrl(file.key);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report file:', error);
      showToast(t('analysis.ERROR'), 'error');
    }
  };

  const handleStartEdit = (record: ProfitItem) => {
    setEditingRowId(record.id);
    setEditingRevenue(record.revenue);
    setEditingExpense(record.expense);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRevenue(0);
    setEditingExpense(0);
  };

  const handleSaveEdit = async (recordId: number) => {
    try {
      setIsSavingEdit(true);
      await updatePosPartnerReport({
        id: recordId,
        revenue: editingRevenue,
        expenditure: editingExpense,
      });
      await mutateReports();
      showToast(t('success.recordUpdated'), 'success');
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating partner report:', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const columns: ColumnsType<ProfitItem> = [
    { title: t('finance.id'), dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
    { title: t('finance.month'), dataIndex: 'month', key: 'month' },
    { title: t('finance.city'), dataIndex: 'city', key: 'city' },
    { title: t('finance.carWash'), dataIndex: 'carWashName', key: 'carWashName' },
    {
      title: t('finance.revenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number, record: ProfitItem) =>
        editingRowId === record.id ? (
          <div onClick={e => e.stopPropagation()}>
            <InputNumber
              value={editingRevenue}
              onChange={val => setEditingRevenue(Number(val ?? 0))}
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
            />
          </div>
        ) : (
          currencyRender(value)
        ),
    },
    {
      title: t('finance.expense'),
      dataIndex: 'expense',
      key: 'expense',
      render: (value: number, record: ProfitItem) =>
        editingRowId === record.id ? (
          <div onClick={e => e.stopPropagation()}>
            <InputNumber
              value={editingExpense}
              onChange={val => setEditingExpense(Number(val ?? 0))}
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
            />
          </div>
        ) : (
          currencyRender(value)
        ),
    },
    { title: t('finance.profit'), dataIndex: 'profit', key: 'profit', render: currencyRender },
    {
      title: t('finance.profitPercent'),
      dataIndex: 'profitPercent',
      key: 'profitPercent',
      render: (val: number) => `${val.toFixed(2)}%`,
    },
    {
      title: t('finance.profitabilityPercent'),
      dataIndex: 'profitabilityPercent',
      key: 'profitabilityPercent',
      render: (val: number) => `${val.toFixed(2)}%`,
    },
    {
      title: t('finance.file'),
      dataIndex: 'file',
      key: 'file',
      render: (file: FileInfo | undefined) =>
        file ? (
          <button
            type="button"
            className="text-primary02 underline"
            onClick={e => {
              e.stopPropagation();
              void handleFileDownload(file);
            }}
          >
            {file.name}
          </button>
        ) : (
          '-'
        ),
    },
    {
      title: t('finance.action'),
      key: 'action',
      render: (_: unknown, record: ProfitItem) => {
        const hasFile = !!record.file;
        const menuItems = [];

        if (hasFile) {
          menuItems.push({
            key: 'download',
            label: (
              <Space>
                <DownloadOutlined />
                {t('finance.download')}
              </Space>
            ),
            onClick: () => handleFileDownload(record.file!),
          });
        }

        menuItems.push({
          key: 'upload',
          label: (
            <Space>
              <UploadOutlined />
              {hasFile ? t('finance.replaceFile') : t('finance.addFile')}
            </Space>
          ),
          onClick: () => {
            const inputEl = fileInputRefs.current.get(record.id);
            if (inputEl) inputEl.click();
          },
        });

        if (editingRowId === record.id) {
          menuItems.push({
            key: 'save',
            label: t('common.save'),
            onClick: () => {
              if (!isSavingEdit) {
                void handleSaveEdit(record.id);
              }
            },
          });
          menuItems.push({
            key: 'cancel',
            label: t('common.cancel'),
            onClick: handleCancelEdit,
          });
        } else {
          menuItems.push({
            key: 'edit',
            label: t('common.edit'),
            onClick: () => handleStartEdit(record),
          });
        }

        return (
          <div onClick={e => e.stopPropagation()}>
            <input
              type="file"
              accept=".csv,.png,text/csv,image/png,.xlsx,.xls"
              style={{ display: 'none' }}
              ref={ref => {
                if (ref) fileInputRefs.current.set(record.id, ref);
                else fileInputRefs.current.delete(record.id);
              }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleFileUpload(record, file);
                }
                e.target.value = '';
              }}
            />
            {editingRowId === record.id ? (
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  type="primary"
                  loading={isSavingEdit}
                  onClick={() => void handleSaveEdit(record.id)}
                >
                  {t('common.save')}
                </Button>
                <Button size="small" onClick={handleCancelEdit}>
                  {t('common.cancel')}
                </Button>
              </div>
            ) : uploadingRowId === record.id ? (
              <Button size="small" loading>
                {record.file ? t('finance.replaceFile') : t('finance.addFile')}
              </Button>
            ) : (
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <MoreOutlined className="cursor-pointer text-primary02 text-lg" />
              </Dropdown>
            )}
          </div>
        );
      },
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'profit-calculation-table-columns');

  const expandedRowRender = (record: ProfitItem) => {
    if (!record.partners?.length) return null;

    const partnerColumns: ColumnsType<PartnerDetail> = [
      { title: t('finance.partnerName'), dataIndex: 'partnerName', key: 'partnerName' },
      {
        title: t('finance.partnerShare'),
        dataIndex: 'share',
        key: 'share',
        render: (val: number, rec) => (rec.partnerId === -1 ? '' : `${val}%`),
      },
      {
        title: t('finance.dividendSum'),
        dataIndex: 'dividendSum',
        key: 'dividendSum',
        render: currencyRender,
      },
      {
        title: t('finance.dividendMonth'),
        dataIndex: 'dividendMonth',
        key: 'dividendMonth',
        render: (date: Date, rec) =>
          rec.partnerId === -1 ? '' : dayjs(date).format('DD.MM.YYYY'),
      },
    ];

    const totalDividend = record.partners.reduce((sum, p) => sum + p.dividendSum, 0);
    const partnersWithTotal = [
      ...record.partners,
      {
        partnerId: -1,
        partnerName: t('finance.total'),
        share: 0,
        dividendSum: totalDividend,
        dividendMonth: new Date(),
      },
    ];

    return (
      <Table
        dataSource={partnersWithTotal}
        columns={partnerColumns}
        pagination={false}
        size="small"
        rowKey="partnerId"
        rowClassName={row => (row.partnerId === -1 ? 'font-bold' : '')}
      />
    );
  };

  const handleRowClick = (record: ProfitItem) => {
    const key = record.id;
    setExpandedRowKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const onFinish = async (values: any) => {
    setIsCreatingReport(true);
    try {
      await createPosPartnerReport({
        posCalculationId: values.posCalculationId,
        revenue: values.revenue || 0,
        expenditure: values.expense || 0,
        billingMonth: dayjs(values.billingMonth).toDate(),
      });

      await mutateReports();
      setDrawerOpen(false);
      form.resetFields();
      showToast(t('success.recordCreated'), 'success');
    } catch (error) {
      console.error('Error creating partner report:', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setIsCreatingReport(false);
    }
  };

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>

      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.profitCalculation')}
          </span>
        </div>
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          {t('routes.add')}
        </Button>
      </div>

      <GeneralFilters count={totalCount} display={['dateTime', 'city', 'pos']} />

      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={paginatedData}
          columns={visibleColumns}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            rowExpandable: record => !!record.partners?.length,
            onExpand: (expanded, record) => {
              if (expanded) setExpandedRowKeys([...expandedRowKeys, record.id]);
              else setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
            },
          }}
          onRow={record => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: currentPage,
            pageSize,
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
      </div>

      <CreateProfitReportDrawer
        open={drawerOpen}
        isCreating={isCreatingReport}
        form={form}
        posOptions={posOptions}
        onClose={() => setDrawerOpen(false)}
        onFinish={onFinish}
      />
    </>
  );
};

export default ProfitCalculation;
