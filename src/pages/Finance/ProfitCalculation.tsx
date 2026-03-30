import React, { useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Drawer, Form, DatePicker, Select, InputNumber, message, Dropdown, Space } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, DownloadOutlined, UploadOutlined, MoreOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, ALL_PAGE_SIZES } from '@/utils/constants';
import { getCurrencyRender } from '@/utils/tableUnits';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { useUser } from '@/hooks/useUserStore';
import useSWR from 'swr';
import { getPoses } from '@/services/api/equipment';

interface PartnerDetail {
  partnerId: number;
  partnerName: string;
  share: number;
  dividendSum: number;
  dividendMonth: Date;
}

interface FileInfo {
  name: string;
  url: string;
}

interface ProfitItem {
  id: number;
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

const initialMockProfitData: ProfitItem[] = [
  {
    id: 12441, month: "Февраль 2026", city: "New Delhi", carWashName: "DS5-051",
    revenue: 413998.20, expense: 362225.18, profit: 51773.02,
    profitPercent: 12.51, profitabilityPercent: 12.51,
    partners: [],
  },
  {
    id: 12442, month: "Февраль 2026", city: "New Delhi", carWashName: "Module001",
    revenue: 0, expense: 111947.61, profit: -111947.61,
    profitPercent: -57.20, profitabilityPercent: -57.20,
    partners: [],
  },
  {
    id: 12401, month: "Февраль 2026", city: "Белгородская область", carWashName: "31 M-01 Новый Оскол",
    revenue: 408601.20, expense: 642332.61, profit: -233731.41,
    profitPercent: -57.20, profitabilityPercent: -57.20,
    partners: [{ partnerId: 1, partnerName: "Попян Мхитар", share: 100, dividendSum: -233731.00, dividendMonth: new Date('2026-02-01') }],
  },
  {
    id: 12402, month: "Февраль 2026", city: "Воронежская область", carWashName: "36 M-01 ул. 9 Января, 68",
    revenue: 0, expense: 932.72, profit: -932.72,
    profitPercent: -0.01, profitabilityPercent: -0.01,
    partners: [
      { partnerId: 2, partnerName: "Канищев С.В.", share: 1.53, dividendSum: -14.00, dividendMonth: new Date('2026-02-01') },
      { partnerId: 3, partnerName: "Канищев P.B.", share: 10.75, dividendSum: -100.00, dividendMonth: new Date('2026-02-01') },
      { partnerId: 4, partnerName: "Макаренко Д.Ю.", share: 9.60, dividendSum: -90.00, dividendMonth: new Date('2026-02-01') },
      { partnerId: 5, partnerName: "Шомин А.В.", share: 78.12, dividendSum: -729.00, dividendMonth: new Date('2026-02-01') },
    ],
  },
  {
    id: 12403, month: "Февраль 2026", city: "Воронежская область", carWashName: "36 М-02 ул. Машиностроителей, 10",
    revenue: 673592.05, expense: 649250.14, profit: 24341.91,
    profitPercent: 3.61, profitabilityPercent: 3.61,
    partners: [],
  },
  {
    id: 12405, month: "Февраль 2026", city: "Воронежская область", carWashName: "36 М-03 ул. Димитрова, 91а",
    revenue: 272806.50, expense: 564321.59, profit: -291515.09,
    profitPercent: -106.86, profitabilityPercent: -106.86,
    partners: [],
  },
  {
    id: 12406, month: "Февраль 2026", city: "Воронежская область", carWashName: "36 М-04 ул. Антонова-Овсеенко, 17 в",
    revenue: 709017.60, expense: 848489.74, profit: -139472.14,
    profitPercent: -19.67, profitabilityPercent: -19.67,
    partners: [],
  },
  {
    id: 12407, month: "Февраль 2026", city: "Воронежская область", carWashName: "36 М-08 ул.Л. Шевцовой, 11",
    revenue: 473891.50, expense: 511662.41, profit: -37770.91,
    profitPercent: -7.97, profitabilityPercent: -7.97,
    partners: [],
  },
  {
    id: 12408, month: "Февраль 2026", city: "Воронежская область", carWashName: "36 М-09 Нововоронеж",
    revenue: 0, expense: 372736.10, profit: -372736.10,
    profitPercent: -872.39, profitabilityPercent: -872.39,
    partners: [],
  },
];

const ProfitCalculation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const month = searchParams.get('month') || undefined;
  const city = searchParams.get('city') || undefined;

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [allProfitItems, setAllProfitItems] = useState<ProfitItem[]>(initialMockProfitData);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: poses } = useSWR('get-poses', () => getPoses({ organizationId: user.organizationId }), {
    revalidateOnFocus: false,
  });
  const posOptions = poses?.map(p => ({ label: p.name, value: p.id })) || [];

  const filteredData = useMemo(() => {
    let filtered = [...allProfitItems];
    if (city) filtered = filtered.filter(item => item.city === city);
    if (month) {
      const monthStr = dayjs(month).format('MMMM YYYY');
      filtered = filtered.filter(item => item.month === monthStr);
    }
    return filtered;
  }, [allProfitItems, city, month]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalCount = filteredData.length;
  const currencyRender = getCurrencyRender();

  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const handleFileUpload = (record: ProfitItem, file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const newFileInfo: FileInfo = { name: file.name, url: fileUrl };
    setAllProfitItems(prev =>
      prev.map(item => (item.id === record.id ? { ...item, file: newFileInfo } : item))
    );
    message.success(t('success.fileUploaded'));
  };

  const handleFileDownload = (file: FileInfo) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns: ColumnsType<ProfitItem> = [
    { title: t('finance.id'), dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
    { title: t('finance.month'), dataIndex: 'month', key: 'month' },
    { title: t('finance.city'), dataIndex: 'city', key: 'city' },
    { title: t('finance.carWash'), dataIndex: 'carWashName', key: 'carWashName' },
    { title: t('finance.revenue'), dataIndex: 'revenue', key: 'revenue', render: currencyRender },
    { title: t('finance.expense'), dataIndex: 'expense', key: 'expense', render: currencyRender },
    { title: t('finance.profit'), dataIndex: 'profit', key: 'profit', render: currencyRender },
    { title: t('finance.profitPercent'), dataIndex: 'profitPercent', key: 'profitPercent', render: (val: number) => val.toFixed(2) + '%' },
    { title: t('finance.profitabilityPercent'), dataIndex: 'profitabilityPercent', key: 'profitabilityPercent', render: (val: number) => val.toFixed(2) + '%' },
    {
      title: t('finance.file'),
      dataIndex: 'file',
      key: 'file',
      render: (file: FileInfo | undefined) => (file ? <span className="text-primary02">{file.name}</span> : '-'),
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

        return (
          <>
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              ref={(ref) => {
                if (ref) fileInputRefs.current.set(record.id, ref);
                else fileInputRefs.current.delete(record.id);
              }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(record, file);
                  e.target.value = '';
                }
              }}
            />
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <MoreOutlined className="cursor-pointer text-primary02 text-lg" />
            </Dropdown>
          </>
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
      { title: t('finance.partnerShare'), dataIndex: 'share', key: 'share', render: (val: number, rec) => rec.partnerId === -1 ? '' : `${val}%` },
      { title: t('finance.dividendSum'), dataIndex: 'dividendSum', key: 'dividendSum', render: currencyRender },
      { title: t('finance.dividendMonth'), dataIndex: 'dividendMonth', key: 'dividendMonth', render: (date: Date, rec) => rec.partnerId === -1 ? '' : dayjs(date).format('DD.MM.YYYY') },
    ];

    const totalDividend = record.partners.reduce((sum, p) => sum + p.dividendSum, 0);
    const partnersWithTotal = [...record.partners, {
      partnerId: -1,
      partnerName: t('finance.total'),
      share: 0,
      dividendSum: totalDividend,
      dividendMonth: new Date(),
    }];

    return (
      <Table
        dataSource={partnersWithTotal}
        columns={partnerColumns}
        pagination={false}
        size="small"
        rowKey="partnerId"
        rowClassName={(row) => row.partnerId === -1 ? 'font-bold' : ''}
      />
    );
  };

  const handleRowClick = (record: ProfitItem) => {
    const key = record.id;
    setExpandedRowKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const onFinish = (values: any) => {
    const selectedPos = posOptions.find(p => p.value === values.posId);
    if (!selectedPos) {
      message.error(t('errors.posNotFound'));
      return;
    }
    const monthDate = values.billingMonth ? dayjs(values.billingMonth) : null;
    if (!monthDate) {
      message.error(t('validation.billingMonthRequired'));
      return;
    }
    const monthStr = monthDate.format('MMMM YYYY');
    const revenue = values.revenue || 0;
    const expense = values.expense || 0;
    const profit = revenue - expense;
    const profitPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
    const profitabilityPercent = (revenue + expense) > 0 ? (profit / (revenue + expense)) * 100 : 0;

    const newId = Math.max(...allProfitItems.map(i => i.id), 0) + 1;

    const newItem: ProfitItem = {
      id: newId,
      month: monthStr,
      city: selectedPos.label,
      carWashName: selectedPos.label,
      revenue,
      expense,
      profit,
      profitPercent,
      profitabilityPercent,
      partners: [],
    };

    setAllProfitItems(prev => [...prev, newItem]);
    setDrawerOpen(false);
    form.resetFields();
    message.success(t('success.recordCreated'));
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
            {t('routes.profitCalculation')}
          </span>
        </div>
        <Button icon={<PlusOutlined />} className="btn-primary" onClick={() => setDrawerOpen(true)}>
          {t('routes.add')}
        </Button>
      </div>

      <GeneralFilters count={totalCount} display={['dateTime', 'city', 'pos']} />

      <div className="mt-8">
        <ColumnSelector checkedList={checkedList} options={options} onChange={setCheckedList} />
        <Table
          rowKey="id"
          loading={false}
          dataSource={paginatedData}
          columns={visibleColumns}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            rowExpandable: (record) => !!(record.partners?.length),
            onExpand: (expanded, record) => {
              if (expanded) setExpandedRowKeys([...expandedRowKeys, record.id]);
              else setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
            },
          }}
          onRow={(record) => ({ onClick: () => handleRowClick(record), style: { cursor: 'pointer' } })}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} ${t('finance.records')}`,
            onChange: (page, size) => updateSearchParams(searchParams, setSearchParams, { page: String(page), size: String(size) }),
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <Drawer title={t('pos.creating')} placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen} width={500}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="posId" label={t('finance.carWash')} rules={[{ required: true, message: t('validation.posRequired') }]}>
            <Select showSearch options={posOptions} filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            } />
          </Form.Item>
          <Form.Item name="revenue" label={t('finance.revenue')} rules={[{ required: true, message: t('validation.fillRevenue') }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} precision={2} addonAfter="₽" />
          </Form.Item>
          <Form.Item name="expense" label={t('finance.expense')} rules={[{ required: true, message: t('validation.fillExpense') }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} precision={2} addonAfter="₽" />
          </Form.Item>
          <Form.Item name="billingMonth" label={t('hr.billingMonth')} rules={[{ required: true, message: t('validation.billingMonthRequired') }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>{t('organizations.save')}</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default ProfitCalculation;