import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { getSaleDocument } from '@/services/api/sale';
import { Table } from 'antd';
import Input from '@ui/Input/Input.tsx';
import DateInput from '@ui/Input/DateInput.tsx';
import dayjs from 'dayjs';
import DropdownInput from '@ui/Input/DropdownInput.tsx';
import { getWarehouses } from '@/services/api/warehouse';
import { ArrowLeftOutlined } from '@ant-design/icons';

const SaleDocumentView: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const documentId = searchParams.get('documentId');

  const { data: saleDocument, isLoading: loadingSaleDocument } = useSWR(
    [`get-sale-document`],
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

  const warehouses: { name: string; value: number }[] =
    warehouseData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const baseColumns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Номенклатура',
      dataIndex: 'nomenclatureName',
      key: 'nomenclatureName',
    },
    {
      title: 'Кол-во',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Итоговая сумма',
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
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.saleDocumentView')}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex">
            <div className="mr-10 text-text01 font-normal text-sm">
              <div>{t('warehouse.no')}</div>
              <div>{t('warehouse.overhead')}</div>
            </div>
            <Input
              type={''}
              value={saleDocument?.name}
              changeValue={() => {}}
              disabled={true}
            />
          </div>
          <div className="flex">
            <div className="flex mt-3 text-text01 font-normal text-sm mx-2">
              {t('warehouse.from')}
            </div>
            <DateInput
              value={
                saleDocument?.saleDate ? dayjs(saleDocument?.saleDate) : null
              }
              changeValue={() => {}}
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
              onChange={() => {}}
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
