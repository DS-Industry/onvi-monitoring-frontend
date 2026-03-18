import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { getNomenclatureSale } from '@/services/api/warehouse';
import { useUser } from '@/hooks/useUserStore';
import { ConsumablesType } from '@/services/api/equipment';

const { Option } = Select;

type AddConsumableModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (nomenclatureId: number, type?: ConsumablesType) => void;
  isLoading?: boolean;
  existingNomenclatureIds: number[];
};

const AddConsumableModal: React.FC<AddConsumableModalProps> = ({
  isOpen,
  onCancel,
  onSubmit,
  isLoading = false,
  existingNomenclatureIds,
}) => {
  const { t } = useTranslation();
  const user = useUser();
  const [selectedNomenclature, setSelectedNomenclature] = useState<number>();
  const [selectedType, setSelectedType] = useState<ConsumablesType>();

  const { data: nomenclatureData } = useSWR(
    isOpen && user.organizationId ? ['get-sale-nomenclatures', user.organizationId] : null,
    () => getNomenclatureSale(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const availableNomenclatures = nomenclatureData
    ? nomenclatureData
        .filter((item: any) => !existingNomenclatureIds.includes(item.props.id))
        .map((item: any) => ({
          label: item.props.name,
          value: item.props.id,
        }))
    : [];

  useEffect(() => {
    if (isOpen) {
      setSelectedNomenclature(undefined);
      setSelectedType(undefined);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (selectedNomenclature) {
      onSubmit(selectedNomenclature, selectedType);
    }
  };

  const handleCancel = () => {
    onCancel();
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
          {t('equipment.addTitle')}
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
            className="w-full sm:w-80"
            optionFilterProp="label"
            showSearch
            filterOption={(input, option) => {
              if (!option?.label) return false;
              return option.label.toString().toLowerCase().includes(input.toLowerCase());
            }}
            suffixIcon={<SearchOutlined className="text-text02" />}
          />
        </div>

        <div>
          <div className="text-sm text-text02">{t('equipment.type')}</div>
          <Select
            placeholder={t('equipment.selectType')}  
            value={selectedType}
            onChange={setSelectedType}
            className="w-full sm:w-80"
            allowClear
          >
            {Object.values(ConsumablesType).map(type => (
              <Option key={type} value={type}>
                {t(`equipment.types.${type}`)}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-6">
        <Button onClick={handleCancel}>{t('organizations.cancel')}</Button>
        <Button
          htmlType="submit"
          loading={isLoading}
          onClick={handleSubmit}
          disabled={!selectedNomenclature}
        >
          {t('organizations.save')}
        </Button>
      </div>
    </Modal>
  );
};

export default AddConsumableModal;