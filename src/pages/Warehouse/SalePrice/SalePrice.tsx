import React, { useState,} from 'react';
import { useTranslation } from 'react-i18next';
import GeneralFilters from '@ui/Filter/GeneralFilters.tsx';
import useSWR, { mutate } from 'swr';
import {deleteSalePrices, getSalePrice, patchSalePrice, postSalePrice, SALE_PRICE_RESPONSE} from "@/services/api/sale";
import {useSearchParams} from "react-router-dom";
import {Card, Table} from "antd";
import useSWRMutation from 'swr/mutation';
import {PlusOutlined} from "@ant-design/icons";
import AntDButton from "antd/es/button";
import Input from '@/components/ui/Input/Input';
import SalePriceModal from "@/pages/Warehouse/SalePrice/SalePriceModal.tsx";
import Typography from "antd/es/typography";


const SalePrice: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const warehouseId = searchParams.get('warehouseId')
        ? Number(searchParams.get('warehouseId'))
        : undefined;
    const [tableData, setTableData] = useState<SALE_PRICE_RESPONSE[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const isEditing = (record: SALE_PRICE_RESPONSE) => record.id === editingKey;

    const edit = (record: SALE_PRICE_RESPONSE) => {
        setEditingKey(record.id);
    };

    const cancel = () => {
        setEditingKey(null);
        mutate([`get-sale-data`, warehouseId]);
    };

    const save = async (id: number) => {
        try {
            const row = tableData.find(item => item.id === id);
            if (!row) return;

            const salePriceData = {
                id: row.id,
                price: row.price,
            };

            const result = await patchSalePriceTrigger({
                valueData: [salePriceData]
            });

            if (result) {
                setEditingKey(null);
                mutate([`get-sale-data`, warehouseId]);
            }
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    };

    const handleChange = (id: number, dataIndex: string, value: string) => {
        setTableData(prevData =>
            prevData.map(item =>
                item.id === id
                    ? { ...item, [dataIndex]: Number(value) }
                    : item
            )
        );
    };

    const { isLoading: salePriceLoading } = useSWR(
        warehouseId ? [`get-sale-data`, warehouseId] : null,
        () => getSalePrice(warehouseId!, {}),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
            onSuccess: (data) => {
                setTableData(data || []);
            }
        }
    );

    const openModal = () => {
        if (!warehouseId) return;
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    const { trigger: patchSalePriceTrigger, isMutating } = useSWRMutation(
        ['patch-sale-prise', warehouseId],
        async (_, { arg }: { arg: { valueData: { id: number; price: number }[] } }) => {
            return patchSalePrice(arg);
        }
    );

    const handleModalSubmit = async (nomenclatureId: number, price: number) => {
        if (!warehouseId) return;

        const newPriceData = {
            warehouseId: warehouseId,
            nomenclatureId: nomenclatureId,
            price: price,
        };

        const result = await postSalePrice(newPriceData);
        if (result) {
            setTableData(prevData => [...prevData, result]);
            setIsModalOpen(false);
        }
    };

    const handleDeleteRow = async () => {
        try {
            setDeleting(true);
            const result = await mutate(
                [`delete-sale-data`],
                () =>
                    deleteSalePrices({ ids: selectedRowKeys.map(key => Number(key)) }),
                false
            );

            if (result) {
                await mutate([`get-sale-data`, warehouseId]);
                setSelectedRowKeys([]);
            }
        } catch (error) {
            console.error('Error deleting nomenclature:', error);
        } finally {
            setDeleting(false);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
        hideSelectAll: true,
    };

    const baseColumns = [
        {
            title: 'Номенклатура',
            dataIndex: 'nomenclatureName',
            key: 'nomenclatureName',
            width: '50%',
            editable: false,
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            width: '30%',
            editable: true,
            render: (value: number, record: SALE_PRICE_RESPONSE) => {
                const editable = isEditing(record);
                return editable ? (
                    <Input
                        type="number"
                        value={value}
                        changeValue={(e) =>
                            handleChange(record.id, 'price', e.target.value)
                        }
                    />
                ) : (
                    <span>{value.toLocaleString('ru-RU')} ₽</span>
                );
            },
        },
        {
            title: 'Операции',
            dataIndex: 'operation',
            key: 'operation',
            width: '20%',
            render: (_: unknown, record: SALE_PRICE_RESPONSE) => {
                const editable = isEditing(record);
                return (
                    <div className="flex space-x-2">
                        {editable ? (
                            <span className="flex space-x-4">
                                <AntDButton onClick={cancel}>
                                    {t('organizations.cancel')}
                                </AntDButton>
                                <AntDButton
                                    onClick={() => save(record.id)}
                                    loading={isMutating}
                                    disabled={record.price < 0}
                                    type="primary"
                                >
                                    {t('organizations.save')}
                                </AntDButton>
                            </span>
                        ) : (
                            <Typography.Link
                                disabled={editingKey !== null}
                                onClick={() => edit(record)}
                            >
                                {t('routes.edit')}
                            </Typography.Link>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <div className="ml-12 md:ml-0 mb-5">
                <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-3xl font-normal text-text01">
                        {t('routes.salePrice')}
                    </span>
                </div>
            </div>

            <GeneralFilters display={['city', 'pos', 'warehouse']}/>

            <Card>
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4">
                    <div className="flex flex-wrap gap-2">
                        <AntDButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openModal}
                            disabled={!warehouseId}
                        >
                            {t('finance.addRow')}
                        </AntDButton>
                        <AntDButton
                            danger
                            disabled={!selectedRowKeys.length}
                            loading={deleting}
                            onClick={handleDeleteRow}
                        >
                            {t('finance.del')} ({selectedRowKeys.length})
                        </AntDButton>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <Table
                        rowKey="id"
                        dataSource={tableData}
                        columns={baseColumns}
                        loading={salePriceLoading}
                        scroll={{ x: 'max-content' }}
                        rowSelection={rowSelection}
                    />
                </div>
            </Card>

            <SalePriceModal
                isOpen={isModalOpen}
                onCancel={handleModalCancel}
                onSubmit={handleModalSubmit}
                isLoading={isMutating}
                tableData={tableData}
            />
        </>
    );
};

export default SalePrice;