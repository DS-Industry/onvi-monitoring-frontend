import React, { useEffect, useState } from 'react';
import {
  getAllStockLevelSales,
  GET_STOCK_LEVEL_SALE_RESPONSE,
} from '@/services/api/warehouse';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, Select } from 'antd';
import { ModalTableData } from '@/pages/Finance/SaleDocument/SaleDocumentCreate.tsx';

type SaleDocumentModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (data: ModalTableData) => void;
  isLoading?: boolean;
  warehouseId: number | undefined;
  existingNomenclatureIds: number[];
};
const SaleDocumentModal: React.FC<SaleDocumentModalProps> = ({
  isOpen,
  onCancel,
  onSubmit,
  isLoading = false,
  warehouseId,
  existingNomenclatureIds,
}) => {
  const { t } = useTranslation();
  const [selectedNomenclature, setSelectedNomenclature] = useState<
    number | null
  >(null);
  const [count, setCount] = useState<number>(0);
  const [availableNomenclatures, setAvailableNomenclatures] = useState<
    GET_STOCK_LEVEL_SALE_RESPONSE[]
  >([]);

  const { data: stockData, isLoading: stockLoading } = useSWR(
    warehouseId && isOpen ? [`get-stock-levels`, warehouseId] : null,
    () => getAllStockLevelSales(warehouseId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (stockData) {
      const available = stockData.filter(
        item =>
          !existingNomenclatureIds.includes(item.nomenclatureId) &&
          item.quantity > 0
      );
      setAvailableNomenclatures(available);

      if (available.length > 0 && !selectedNomenclature) {
        setSelectedNomenclature(available[0].nomenclatureId);
      }
    }
  }, [stockData, existingNomenclatureIds, selectedNomenclature]);

  const selectedNomenclatureData = availableNomenclatures.find(
    item => item.nomenclatureId === selectedNomenclature
  );

  const handleSubmit = () => {
    if (
      selectedNomenclatureData &&
      count > 0 &&
      count <= selectedNomenclatureData.quantity
    ) {
      const newRow: ModalTableData = {
        nomenclatureId: selectedNomenclatureData.nomenclatureId,
        nomenclatureName: selectedNomenclatureData.nomenclatureName,
        quantity: selectedNomenclatureData.quantity,
        price: selectedNomenclatureData.price,
        count: count,
        fullSum: selectedNomenclatureData.price * count,
      };
      onSubmit(newRow);
      setSelectedNomenclature(null);
      setCount(0);
    }
  };

  const handleCancel = () => {
    onCancel();
    setSelectedNomenclature(null);
    setCount(0);
  };

  const canSubmit =
    selectedNomenclatureData &&
    count > 0 &&
    count <= selectedNomenclatureData.quantity;

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={false}
      title={t('sale.nomenclature')}
      className="w-full sm:w-[600px]"
    >
      <div className="flex flex-col space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-text01 mb-2">
            {t('sale.nomenclature')}
          </label>
          <Select
            showSearch
            placeholder={t('sale.selectNomenclature')}
            className="w-full"
            optionFilterProp="label"
            value={selectedNomenclature}
            onChange={setSelectedNomenclature}
            loading={stockLoading}
            options={availableNomenclatures.map(item => ({
              value: item.nomenclatureId,
              label: item.nomenclatureName,
            }))}
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>

        {selectedNomenclatureData && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text01 mb-2">
                  {t('sale.availability')}
                </label>
                <Input
                  value={selectedNomenclatureData.quantity}
                  disabled
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text01 mb-2">
                  {t('sale.price')}
                </label>
                <Input
                  value={selectedNomenclatureData.price}
                  disabled
                  className="w-full"
                  addonAfter="₽"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text01 mb-2">
                {t('sale.saleQuantity')}
              </label>
              <Input
                type="number"
                min={1}
                max={selectedNomenclatureData.quantity}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full"
              />
              {count > selectedNomenclatureData.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {t('sale.quantityExceeded')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text01 mb-2">
                {t('sale.totalAmount')}
              </label>
              <Input
                value={(selectedNomenclatureData.price * count).toLocaleString(
                  'ru-RU'
                )}
                disabled
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-6">
        <Button onClick={handleCancel}>{t('organizations.cancel')}</Button>
        <Button
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {t('organizations.save')}
        </Button>
      </div>
    </Modal>
  );
};
export default SaleDocumentModal;
