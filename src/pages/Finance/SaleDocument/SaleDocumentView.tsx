import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { getSaleDocument, returnSaleDocument } from '@/services/api/sale';
import { Button, Popconfirm, Table } from 'antd';
import Input from '@ui/Input/Input.tsx';
import DateInput from '@ui/Input/DateInput.tsx';
import dayjs from 'dayjs';
import DropdownInput from '@ui/Input/DropdownInput.tsx';
import { getWarehouses } from '@/services/api/warehouse';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useToast } from '@/components/context/useContext';

const SaleDocumentView: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const documentId = searchParams.get('documentId');
  const userPermissions = usePermissions();
  const { showToast } = useToast();

  const allowedReturn = hasPermission(
    [
      { action: 'manage', subject: 'Warehouse' },
      { action: 'update', subject: 'Warehouse' },
    ],
    userPermissions
  );

  const { data: saleDocument, isLoading: loadingSaleDocument } = useSWR(
    documentId ? [`get-sale-document`, documentId] : null,
    () => getSaleDocument(Number(documentId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: warehouseData } = useSWR(
    [`get-warehouse`],
    () => getWarehouses({}),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: returnDoc, isMutating: returningDoc } = useSWRMutation(
    ['return-sale-document'],
    (_, { arg }: { arg: number }) => returnSaleDocument(arg)
  );

  const handleReturn = async () => {
    await returnDoc(Number(documentId));
    await mutate(
      key => Array.isArray(key) && key[0] === 'get-sales-document'
    );
    showToast(t('sale.returnSuccess'), 'success');
    navigate('/finance/saleDocument');
  };

  const warehouses: { name: string; value: number }[] =
    warehouseData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const baseColumns = [
    {
      title: t('warehouse.no'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('routes.nomenclature'),
      dataIndex: 'nomenclatureName',
      key: 'nomenclatureName',
    },
    {
      title: t('sale.remainder'),
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: t('marketing.total'),
      dataIndex: 'fullSum',
      key: 'fullSum',
    },
  ];

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.saleDocumentView')}
          </span>
        </div>
        {allowedReturn && !loadingSaleDocument && (
          <Popconfirm
            title={t('sale.returnConfirm')}
            onConfirm={handleReturn}
            okText={t('sale.return')}
            cancelText={t('organizations.cancel')}
          >
            <Button className="btn-primary" loading={returningDoc}>
              {t('sale.return')}
            </Button>
          </Popconfirm>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex">
            <div className="mr-10 text-text01 font-normal text-sm">
              <div>{t('warehouse.no')}</div>
              <div>{t('warehouse.overhead')}</div>
            </div>
            <Input value={saleDocument?.name} disabled={true} />
          </div>
          <div className="flex">
            <div className="flex mt-3 text-text01 font-normal text-sm mx-2">
              {t('warehouse.from')}
            </div>
            <DateInput
              value={
                saleDocument?.saleDate ? dayjs(saleDocument?.saleDate) : null
              }
              disabled={true}
            />
          </div>
        </div>
        <div className="flex flex-col space-y-6">
          <div className="flex space-x-2">
            <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">
              {t('warehouse.manager')}
            </div>
            <Input
              value={saleDocument?.responsibleManagerName}
              classname="w-48 sm:w-80"
              disabled={true}
            />
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center sm:justify-center sm:w-64 text-text01 font-normal text-sm">
              {t('warehouse.ware')}
            </div>
            <DropdownInput
              value={saleDocument?.warehouseId}
              options={warehouses}
              classname="w-48 sm:w-80"
              isDisabled={true}
            />
          </div>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={saleDocument?.details}
        columns={baseColumns}
        loading={loadingSaleDocument}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
};

export default SaleDocumentView;
