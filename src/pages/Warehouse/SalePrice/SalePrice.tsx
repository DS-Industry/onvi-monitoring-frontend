import React, {useEffect, useState,} from 'react';
import { useTranslation } from 'react-i18next';
import GeneralFilters from '@ui/Filter/GeneralFilters.tsx';
import useSWR, { mutate } from 'swr';
import {getSalePrice, patchSalePrice, postSalePrice, SALE_PRICE_RESPONSE} from "@/services/api/sale";
import {useSearchParams} from "react-router-dom";
import {Card, Modal, Table} from "antd";
import Button from '@/components/ui/Button/Button';
import {getNomenclatureSale} from "@/services/api/warehouse";
import {useUser} from "@/hooks/useUserStore.ts";
import useSWRMutation from 'swr/mutation';
import {PlusOutlined} from "@ant-design/icons";
import AntDButton from "antd/es/button";
import SearchDropdownInput from "@ui/Input/SearchDropdownInput.tsx";
import Input from '@/components/ui/Input/Input';


const SalePrice: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const warehouseId = searchParams.get('warehouseId')
        ? Number(searchParams.get('warehouseId'))
        : undefined;
    const [tableData, setTableData] = useState<SALE_PRICE_RESPONSE[]>([]);
    const user = useUser();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNomenclature, setSelectedNomenclature] = useState<number | undefined>(undefined);    const [availableNomenclatures, setAvailableNomenclatures] = useState<{ name: string; value: number }[]>([]);
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

    useEffect(() => {
        const nomenclatures = nomenclatureData?.map(item => ({
            name: item.props.name,
            value: item.props.id,
        })) || [];

        const available = nomenclatures.filter(nom =>
            !tableData.some(row => row.nomenclatureId === nom.value)
        );

        setAvailableNomenclatures(available);
    }, [nomenclatureData, tableData]);

    useEffect(() => {
        if (isModalOpen && availableNomenclatures.length > 0 && !selectedNomenclature) {
            setSelectedNomenclature(availableNomenclatures[0].value);
        }
    }, [isModalOpen, availableNomenclatures, selectedNomenclature]);

    const openModal = () => {
        if (!warehouseId) {
            return;
        }
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setSelectedNomenclature(undefined);
        setNewPrice(0);
    };

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
                return [...prevData, result];
            });

            setSelectedNomenclature(undefined);
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
            render: (value: number, record: SALE_PRICE_RESPONSE) => (
                <Input
                    type="number"
                    value={value}
                    changeValue={(e) =>
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
            <GeneralFilters display={['city', 'pos', 'warehouse']}/>
            <Card>
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4">
                    <div className="flex flex-wrap gap-2">
                        <AntDButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openModal}
                            disabled={!warehouseId || availableNomenclatures.length === 0}
                        >
                            {t('finance.addRow')}
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
                    />
                </div>
                {tableData && tableData.length > 0 && (
                    <div className="flex mt-4 space-x-4">
                        <Button
                            title={t('organizations.save')}
                            form={true}
                            isLoading={isMutating}
                            handleClick={handleSubmit}
                        />
                    </div>
                )}
            </Card>

            <Modal
                open={isModalOpen}
                onCancel={handleModalCancel}
                okButtonProps={{
                    disabled: !selectedNomenclature || newPrice < 0,
                }}
                footer={false}
                className="w-full sm:w-[600px] max-h-[550px] overflow-y-auto"
            >
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01 text-center sm:text-left">
                        {t('sale.create')}
                    </h2>
                </div>

                <div className="flex flex-col space-y-4 text-text02">
                    <SearchDropdownInput
                        title={t('sale.nomenclature')}
                        classname="w-full"
                        options={availableNomenclatures}
                        value={selectedNomenclature || ''}
                        onChange={setSelectedNomenclature}
                    />
                    <Input
                        title={t('sale.price')}
                        type="number"
                        classname="w-full"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                        value={newPrice}
                        changeValue={e => setNewPrice(Number(e.target.value))}
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-6">
                    <Button
                        title={t('organizations.cancel')}
                        type="outline"
                        handleClick={handleModalCancel}
                    />
                    <Button
                        title={t('organizations.save')}
                        form={true}
                        isLoading={isMutating}
                        handleClick={handleModalSubmit}
                    />
                </div>
            </Modal>
        </>
    );
};

export default SalePrice;