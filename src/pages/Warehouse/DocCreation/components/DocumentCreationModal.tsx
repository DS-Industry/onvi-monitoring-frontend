import React, { useState } from 'react';
import { Modal, Table } from 'antd';
import Button from '@ui/Button/Button';
import { useTranslation } from 'react-i18next';
import NoDataUI from '@ui/NoDataUI';
import { useSearchParams } from 'react-router-dom';
import SearchInput from '@ui/Input/SearchInput';
import InventoryEmpty from '@/assets/NoInventory.png';
import useSWR from 'swr';
import { getInventoryItems, getNomenclature } from '@/services/api/warehouse';
import { useUser } from '@/hooks/useUserStore';

type NomenclatureItem = {
  oldQuantity?: number | undefined;
  deviation?: number | undefined;
  id: number;
  check: boolean;
  responsibleId: number;
  responsibleName: string;
  nomenclatureId: number;
  quantity: number;
  comment: string;
};

interface DocumentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  classname?: string;
  onClick: React.Dispatch<React.SetStateAction<NomenclatureItem[]>>;
}

const DocumentCreationModal: React.FC<DocumentCreationModalProps> = ({
  isOpen,
  onClose,
  classname,
  onClick,
}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const documentType = searchParams.get('document');
  const [searchNomen, setSearchNomen] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>(
    {}
  );
  const warehouseId = searchParams.get('warehouseId') || '*';

  const handleCheckboxChange = (id: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const user = useUser();

  const addProductItem = () => {
    const dataSource =
      documentType === 'RECEIPT' ? nomenclatureItems : inventoryItems;

    if (!dataSource || !selectedItems) {
      return;
    }

    onClick(prevData => {
      const existingNomenclatureIds = new Set(
        prevData.map(item => item.nomenclatureId)
      );

      const selectedData = dataSource
        .filter(
          item =>
            selectedItems?.[item.nomenclatureId] &&
            !existingNomenclatureIds.has(item.nomenclatureId)
        )
        .map(item => ({
          id: item.nomenclatureId,
          check: true,
          responsibleId: user.id,
          responsibleName: user.name,
          nomenclatureId: item.nomenclatureId,
          quantity: 0,
          comment: '',
          ...(documentType === 'INVENTORY' && { oldQuantity: 0, deviation: 0 }),
        }));

      if (selectedData.length === 0) {
        return prevData;
      }

      return [...prevData, ...selectedData];
    });

    onClose();
  };

  const { data: nomenclatureData } = useSWR(
    ['get-inventory'],
    () => getNomenclature(1),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: inventoryItemData } = useSWR(
    warehouseId !== null && warehouseId !== '*' && !isNaN(Number(warehouseId))
      ? [`get-inventory-items`]
      : null,
    () => getInventoryItems(Number(warehouseId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const nomenclatureItems: {
    nomenclatureId: number;
    nomenclatureName: string;
    sku: string;
  }[] =
    nomenclatureData
      ?.map(item => ({
        nomenclatureId: item.props.id,
        nomenclatureName: item.props.name,
        sku: item.props.sku,
      }))
      .filter(item =>
        item.nomenclatureName.toLowerCase().includes(searchNomen.toLowerCase())
      ) || [];

  const inventoryItems: {
    nomenclatureId: number;
    nomenclatureName: string;
    sku: number;
  }[] =
    inventoryItemData
      ?.map(item => ({
        nomenclatureId: item.nomenclatureId,
        nomenclatureName: item.nomenclatureName,
        sku: item.quantity,
      }))
      .filter(item =>
        item.nomenclatureName.toLowerCase().includes(searchNomen.toLowerCase())
      ) || [];

  const columnsInventoryItems = [
    {
      title: '',
      dataIndex: 'check',
      key: 'check',
      width: 50,
      render: (_: unknown, row: { nomenclatureId: number }) => (
        <input
          type="checkbox"
          checked={!!selectedItems[row.nomenclatureId]}
          className="w-[18px] h-[18px]"
          onChange={() => handleCheckboxChange(row.nomenclatureId)}
        />
      ),
    },
    {
      title: 'Код',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Наименование товара',
      dataIndex: 'nomenclatureName',
      key: 'nomenclatureName',
    },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className={`rounded-2xl ${classname || ''}`}
      width="90%"
      style={{ maxWidth: '1000px', maxHeight: '90vh' }}
      bodyStyle={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}
      closable={false}
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-text01">
          {t('warehouse.advanced')}
        </h2>
        <div
          onClick={onClose}
          className="cursor-pointer text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </div>
      </div>
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl h-full max-h-[90vh] overflow-y-auto flex flex-col space-y-5 p-4">
        <div className="flex">
          <SearchInput
            value={searchNomen}
            onChange={value => setSearchNomen(value)}
            classname="w-full sm:w-64"
            searchType="outlined"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          {documentType === 'RECEIPT' ? (
            nomenclatureItems.length > 0 ? (
              <Table
                dataSource={nomenclatureItems}
                columns={columnsInventoryItems}
                pagination={false}
              />
            ) : (
              <div className="flex flex-col justify-center items-center">
                <NoDataUI title={t('roles.invent')} description={''}>
                  <img
                    src={InventoryEmpty}
                    className="mx-auto"
                    loading="lazy"
                    alt="Inventory"
                  />
                </NoDataUI>
              </div>
            )
          ) : inventoryItems.length > 0 ? (
            <Table
              dataSource={inventoryItems}
              columns={columnsInventoryItems}
              pagination={false}
            />
          ) : (
            <div className="flex flex-col justify-center items-center">
              <NoDataUI title={t('roles.invent')} description={''}>
                <img
                  src={InventoryEmpty}
                  className="mx-auto"
                  loading="lazy"
                  alt="Inventory"
                />
              </NoDataUI>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <Button
          title={t('organizations.cancel')}
          handleClick={onClose}
          type="outline"
        />
        <Button
          title={t('roles.addSel')}
          handleClick={addProductItem}
          iconPlus
        />
      </div>
    </Modal>
  );
};

export default DocumentCreationModal;