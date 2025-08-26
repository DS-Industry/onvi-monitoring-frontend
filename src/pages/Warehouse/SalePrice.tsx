import React, {useEffect, useState,} from 'react';
import { useTranslation } from 'react-i18next';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import useSWR, { mutate } from 'swr';
import {getSalePrice, patchSalePrice, postSalePrice} from "@/services/api/sale";
import {useSearchParams} from "react-router-dom";
import {Button, Card, Input, Modal, Select, Table} from "antd";
import {getNomenclatureSale} from "@/services/api/warehouse";
import {useUser} from "@/hooks/useUserStore.ts";
import useSWRMutation from 'swr/mutation';

interface TableRow {
    id: number;
    nomenclatureId: number;
    warehouseId: number;
    price: number;
}

const SalePrice: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const [totalCount] = useState(0);
    const warehouseId = searchParams.get('warehouseId')
        ? Number(searchParams.get('warehouseId'))
        : undefined;
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const user = useUser();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNomenclature, setSelectedNomenclature] = useState<number | null>(null);
    const [newPrice, setNewPrice] = useState<number>(0);

    const handleChange = (id: number, dataIndex: string, value: string) => {
        setTableData(prevData =>
            prevData.map(item =>
                item.id === id
                    ? { ...item, [dataIndex]: Number(value) }
                    : item
            )
        );
    };

    const { data: salePriceData, isLoading: salePriceLoading } = useSWR(
        warehouseId ? [`get-sale-data`, warehouseId] : null,
        () => getSalePrice(warehouseId!, {}),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    const { data: nomenclatureData } = useSWR(
        user.organizationId ? [`get-sale`, user.organizationId] : null,
        () => getNomenclatureSale(user.organizationId!),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );
    const nomenclatures =
        nomenclatureData?.map(item => ({
            label: item.props.name,
            value: item.props.id,
        })) || [];
    const availableNomenclatures = nomenclatures.filter(nom =>
        !tableData.some(row => row.nomenclatureId === nom.value)
    );

    const openModal = () => {
        if (!warehouseId) {
            return;
        }
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (isModalOpen && availableNomenclatures.length > 0 && !selectedNomenclature) {
            setSelectedNomenclature(availableNomenclatures[0].value);
        }
    }, [isModalOpen, availableNomenclatures, selectedNomenclature]);

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setSelectedNomenclature(null);
        setNewPrice(0);
    };

    useEffect(() => {
        if (salePriceData) {
            const transformedData = salePriceData.map((item) => ({
                id: item.props.id,
                nomenclatureId: item.props.nomenclatureId,
                warehouseId: item.props.warehouseId,
                price: item.props.price,
            }));
            setTableData(transformedData);
        }
    }, [salePriceData]);

    const { trigger: patchSalePriceTrigger, isMutating } = useSWRMutation(
        ['patch-sale-prise', warehouseId],
        async (
            _,
            {
                arg,
            }: {
                arg: {
                    valueData: {
                        id: number;
                        price: number;
                    }[];
                };
            }
        ) => {
            return patchSalePrice(arg);
        }
    );

    const handleSubmit = async () => {
        const hasNegativeValues =
            tableData &&
            tableData.some(data => data.price < 0);

        if (hasNegativeValues) {
            return;
        }

        const salePrice: {
            id: number;
            price: number;
        }[] =
            tableData?.map(data => ({
                id: data.id,
                price: data.price,
            })) || [];

        const result = await patchSalePriceTrigger({
            valueData: salePrice,
        });

        if (result) {
            mutate([`get-sale-data`, warehouseId]);
        }
    };

    const handleModalSubmit = async () => {
        if (!selectedNomenclature || !warehouseId) return;

        const newPriceData: {
            warehouseId: number;
            nomenclatureId: number;
            price: number;
        } = {
            warehouseId: warehouseId,
            nomenclatureId: selectedNomenclature,
            price: newPrice,
        };

        const result = await postSalePrice(newPriceData);

        if (result) {

            setTableData(prevData => {
                const newRow: TableRow = {
                    id: result.props.id,
                    nomenclatureId: result.props.nomenclatureId,
                    warehouseId: result.props.warehouseId,
                    price: result.props.price,
                };

                return [...prevData, newRow];
            });

            setSelectedNomenclature(null);
            setNewPrice(0);
            setIsModalOpen(false);
        }
    };

    const baseColumns = [
        {
            title: 'Номенклатура',
            dataIndex: 'nomenclatureId',
            key: 'nomenclatureId',
            width: 240,
            onCell: (record: TableRow) => ({
                record,
                inputType: 'select',
                dataIndex: 'nomenclatureId',
                title: 'Номенклатура',
                editing: true,
                options: nomenclatures,
            }),
            render: (value: number) => {
                const found = nomenclatures.find(n => n.value === value);
                return found ? found.label : t('warehouse.notSel');
            },
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            onCell: (record: TableRow) => ({
                record,
                inputType: 'number',
                dataIndex: 'price',
                title: 'Цена',
                editing: true,
            }),
            render: (value: number, record: TableRow) => (
                <Input
                    type="number"
                    value={value}
                    onChange={(e) =>
                        handleChange(record.id, 'price', e.target.value)
                    }
                />
            ),
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
            <GeneralFilters count={totalCount} display={['city', 'pos', 'warehouse']}/>
            <Card>
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={openModal}
                            disabled={!warehouseId || availableNomenclatures.length === 0}
                        >
                            {t('routes.add')}
                        </Button>
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    <Table
                        rowKey="id"
                        dataSource={tableData}
                        columns={baseColumns}
                        loading={salePriceLoading}
                        scroll={{ x: 'max-content' }}
                    />
                </div>
                {tableData && tableData.length > 0 && (
                    <div className="flex mt-4 space-x-4">
                        <Button
                            htmlType="submit"
                            loading={isMutating}
                            onClick={handleSubmit}
                            className="w-[168px] btn-primary"
                        >
                            {t('organizations.save')}
                        </Button>
                    </div>
                )}
            </Card>

            <Modal
                open={isModalOpen}
                onCancel={handleModalCancel}
                onOk={handleModalSubmit}
                className="w-96"
                okButtonProps={{
                    disabled: !selectedNomenclature || newPrice < 0,
                }}
                okText={t('organizations.save')}
                cancelText={t('organizations.cancel')}
            >
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-text01">
                        {t('sale.create')}
                    </h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-text01">
                            {t('sale.nomenclature')}
                        </label>
                        <Select
                            value={selectedNomenclature}
                            onChange={setSelectedNomenclature}
                            options={availableNomenclatures}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-text01">
                            {t('sale.price')}
                        </label>
                        <Input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(Number(e.target.value))}
                            min={0}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SalePrice;