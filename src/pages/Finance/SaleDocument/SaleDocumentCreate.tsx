import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getWarehouses } from '@/services/api/warehouse';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, InputNumber, Select, Table } from 'antd';
import {
  getManagers,
  postSaleDocument,
  SALE_DOCUMENT_CREATE_REQUEST,
} from '@/services/api/sale';
import Button from 'antd/es/button';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import SaleDocumentModal from '@/pages/Finance/SaleDocument/SaleDocumentModal.tsx';
import { useNavigate } from 'react-router-dom';

export type ModalTableData = {
  nomenclatureId: number;
  nomenclatureName: string;
  quantity: number;
  price: number;
  count: number;
  fullSum: number;
};

const SaleDocumentCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const [managerId, setManagerId] = useState<number | null>();
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return dayjs().toDate().toISOString().split('T')[0];
  });

  const [tableData, setTableData] = useState<ModalTableData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const existingNomenclatureIds = tableData.map(item => item.nomenclatureId);
  const totalSum = tableData.reduce((sum, item) => sum + item.fullSum, 0);

  const canSave = warehouseId && managerId && tableData.length > 0;

  const openModal = () => {
    if (!warehouseId) return;
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = (newRow: ModalTableData) => {
    setTableData(prev => {
      const existingIndex = prev.findIndex(
        item => item.nomenclatureId === newRow.nomenclatureId
      );

      if (existingIndex !== -1) {
        const updatedData = [...prev];
        updatedData[existingIndex] = {
          ...updatedData[existingIndex],
          count: Math.min(
            updatedData[existingIndex].count + newRow.count,
            updatedData[existingIndex].quantity
          ),
          fullSum:
            updatedData[existingIndex].price *
            Math.min(
              updatedData[existingIndex].count + newRow.count,
              updatedData[existingIndex].quantity
            ),
        };
        return updatedData;
      }

      return [...prev, newRow];
    });
    setIsModalOpen(false);
  };

  const handleCountChange = (nomenclatureId: number, newCount: number) => {
    setTableData(prevData =>
      prevData.map(item => {
        if (item.nomenclatureId === nomenclatureId) {
          const validatedCount = Math.max(1, Math.min(item.quantity, newCount));
          return {
            ...item,
            count: validatedCount,
            fullSum: item.price * validatedCount,
          };
        }
        return item;
      })
    );
  };

  const handleSaveDocument = async () => {
    if (!canSave) return;

    setIsLoading(true);
    try {
      const requestData: SALE_DOCUMENT_CREATE_REQUEST = {
        warehouseId: warehouseId!,
        managerId: managerId!,
        saleDate: selectedDate ? new Date(selectedDate) : new Date(),
        items: tableData.map(item => ({
          nomenclatureId: item.nomenclatureId,
          quantity: item.count,
          fullSum: item.fullSum,
        })),
      };

      const result = await postSaleDocument(requestData);

      if (result) {
        navigate('/finance/saleDocument');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const { data: managersData } = useSWR(
    warehouseId ? [`get-managers`, warehouseId] : null,
    () => getManagers(warehouseId as number),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const baseColumns = [
    {
      title: t('routes.nomenclature'),
      dataIndex: 'nomenclatureName',
      key: 'nomenclatureName',
    },
    {
      title: t('sale.price'),
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString('ru-RU')} ₽`,
    },
    {
      title: t('sale.remainder'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('sale.qty'),
      dataIndex: 'count',
      key: 'count',
      render: (count: number, record: ModalTableData) => (
        <InputNumber
          min={1}
          max={record.quantity}
          value={count}
          onChange={value => {
            if (value !== null) {
              handleCountChange(record.nomenclatureId, Number(value));
            }
          }}
          className="w-full"
          style={{ width: '80px' }}
          size="small"
        />
      ),
    },
    {
      title: t('marketing.total'),
      dataIndex: 'fullSum',
      key: 'fullSum',
      render: (sum: number) => `${sum.toLocaleString('ru-RU')} ₽`,
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
            {t('routes.saleDocumentCreate')}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 py-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex">
            <div className="flex items-center justify-center text-text01 font-normal text-sm mx-2">
              {t('sale.date')}
            </div>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(date: Dayjs | null) =>
                setSelectedDate(date ? date.toISOString() : '')
              }
            />
          </div>
        </div>
        <div className="flex flex-col space-y-6">
          <div className="flex space-x-2">
            <div className="flex items-center sm:justify-center text-text01 font-normal text-sm">
              {t('warehouse.ware')}
            </div>
            <Select
              showSearch
              allowClear
              placeholder={t('warehouse.enterWare')}
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              value={warehouseId}
              onChange={value => {
                setWarehouseId(value);
                setManagerId(null);
              }}
              style={{ width: '20rem' }}
              options={warehouses.map(w => ({
                value: w.value,
                label: w.name,
              }))}
            />
          </div>
        </div>
        {warehouseId && (
          <div className="flex space-x-2">
            <div className="flex items-center sm:justify-center text-text01 font-normal text-sm">
              {t('sale.manager')}
            </div>
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              value={managerId}
              onChange={value => setManagerId(value)}
              style={{ width: '20rem' }}
              loading={!managersData && !!warehouseId}
              options={
                managersData?.map(m => ({
                  value: m.id,
                  label: m.name,
                })) || []
              }
            />
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openModal}
            disabled={!warehouseId}
          >
            {t('finance.addRow')}
          </Button>
        </div>
      </div>

      <Table
        dataSource={tableData}
        columns={baseColumns}
        rowKey="nomenclatureId"
        footer={() => (
          <div className="flex justify-end font-semibold">
            {t('sale.totalSum')} {totalSum.toLocaleString('ru-RU')} ₽
          </div>
        )}
      />

      <SaleDocumentModal
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        warehouseId={warehouseId}
        existingNomenclatureIds={existingNomenclatureIds}
      />

      <div className="mt-4 flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
        <Button
          onClick={() => navigate('/finance/saleDocument')}
          disabled={isLoading}
        >
          {t('organizations.cancel')}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          onClick={handleSaveDocument}
          disabled={!canSave || isLoading}
        >
          {t('warehouse.saveAccept')}
        </Button>
      </div>
    </>
  );
};

export default SaleDocumentCreate;
