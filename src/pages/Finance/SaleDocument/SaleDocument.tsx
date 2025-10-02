import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getSaleDocuments } from '@/services/api/sale';
import useSWR from 'swr';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants.ts';
import GeneralFilters from '@ui/Filter/GeneralFilters.tsx';
import { Button, Table } from 'antd';
import { getDateRender } from '@/utils/tableUnits.tsx';
import { PlusOutlined } from '@ant-design/icons';

const SaleDocument: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = dayjs().toDate();
  const formattedDate = today.toISOString().slice(0, 10);

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const warehouseId = searchParams.get('warehouseId')
    ? Number(searchParams.get('warehouseId'))
    : undefined;
  const dateStart =
    searchParams.get('dateStart') ??
    dayjs().toDate().toISOString().slice(0, 10);
  const dateEnd =
    searchParams.get('dateEnd') ?? dayjs().toDate().toISOString().slice(0, 10);

  const { data: salesData, isLoading: saleDocumentLoading } = useSWR(
    [
      `get-sales-document`,
      dateStart,
      dateEnd,
      warehouseId,
      currentPage,
      pageSize,
    ],
    () =>
      getSaleDocuments({
        dateStart: new Date(dateStart || `${formattedDate} 00:00`),
        dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
        warehouseId: warehouseId,
        page: currentPage,
        size: pageSize,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const dateRender = getDateRender();

  const baseColumns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Номер',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: { id: number }) => (
        <Link
          to={{
            pathname: '/finance/saleDocument/view',
            search: `?documentId=${record.id}`,
          }}
          className="text-primary02 hover:text-primary02_Hover font-semibold"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'saleDate',
      key: 'saleDate',
      render: dateRender,
    },
    {
      title: 'Склад',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Ответственный менеджер',
      dataIndex: 'responsibleManagerName',
      key: 'responsibleManagerName',
    },
  ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.saleDocument')}
          </span>
        </div>
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => navigate(`/finance/saleDocument/create`)}
        >
          <div className="hidden sm:flex">{t('routes.add')}</div>
        </Button>
      </div>

      <GeneralFilters display={['city', 'pos', 'warehouse', 'dateTime']} />

      <div className="w-full overflow-x-auto">
        <Table
          rowKey="id"
          dataSource={salesData}
          columns={baseColumns}
          loading={saleDocumentLoading}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );
};

export default SaleDocument;
