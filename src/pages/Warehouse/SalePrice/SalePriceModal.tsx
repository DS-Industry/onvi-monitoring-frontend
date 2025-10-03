import React, { useEffect, useState } from 'react';
import { getNomenclatureSale } from '@/services/api/warehouse';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore.ts';
import { Button, Input, Modal, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

type ModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (selectedNomenclature: number, newPrice: number) => void;
  isLoading?: boolean;
  tableData: { nomenclatureId: number }[];
};

const SalePriceModal: React.FC<ModalProps> = ({
  isOpen,
  onCancel,
  onSubmit,
  isLoading = false,
  tableData,
}) => {
  const { t } = useTranslation();
  const user = useUser();
  const [selectedNomenclature, setSelectedNomenclature] = useState<
    number | undefined
  >(undefined);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [availableNomenclatures, setAvailableNomenclatures] = useState<
    { label: string; value: number }[]
  >([]);

  const { data: nomenclatureData } = useSWR(
    user.organizationId && isOpen
      ? [`get-sale-modal`, user.organizationId]
      : null,
    () => getNomenclatureSale(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (nomenclatureData) {
      const allNomenclatures = nomenclatureData.map(item => ({
        label: item.props.name,
        value: item.props.id,
      }));

      const available = allNomenclatures.filter(
        nom => !tableData.some(row => row.nomenclatureId === nom.value)
      );

      setAvailableNomenclatures(available);

      if (available.length > 0 && !selectedNomenclature) {
        setSelectedNomenclature(available[0].value);
      }
    }
  }, [nomenclatureData, tableData, selectedNomenclature]);

  const handleSubmit = () => {
    if (selectedNomenclature) {
      onSubmit(selectedNomenclature, newPrice);
      setSelectedNomenclature(undefined);
      setNewPrice(0);
    }
  };

  const handleCancel = () => {
    onCancel();
    setSelectedNomenclature(undefined);
    setNewPrice(0);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={false}
      className="w-full sm:w-[600px] max-h-[550px] overflow-y-auto"
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
          {t('sale.create')}
        </h2>
      </div>

      <div className="flex flex-col space-y-4 text-text02">
        <div>
          <div className="text-sm text-text02">{t('sale.nomenclature')}</div>
          <Select
            placeholder={t('warehouse.notSel')}
            options={availableNomenclatures}
            value={selectedNomenclature}
            onChange={setSelectedNomenclature}
            className="w-80"
            optionFilterProp="label"
            showSearch={true}
            filterOption={(input, option) => {
              if (!option || !option.label) return false;
              return option.label.toLowerCase().includes(input.toLowerCase());
            }}
            suffixIcon={<SearchOutlined className="text-text02" />}
          />
        </div>
        <div>
          <div className="text-sm text-text02">{t('sale.price')}</div>
          <Input
            type="number"
            className="w-80"
            suffix={<div className="text-text02 text-xl">₽</div>}
            value={newPrice}
            onChange={e => setNewPrice(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-6">
        <Button onClick={handleCancel}>{t('organizations.cancel')}</Button>
        <Button
          htmlType="submit"
          loading={isLoading}
          onClick={handleSubmit}
          disabled={!selectedNomenclature || newPrice < 0}
        >
          {t('organizations.save')}
        </Button>
      </div>
    </Modal>
  );
};

export default SalePriceModal;
