import React, {useEffect, useState} from "react";
import {getNomenclatureSale} from "@/services/api/warehouse";
import useSWR from "swr";
import {useTranslation} from "react-i18next";
import SearchDropdownInput from "@ui/Input/SearchDropdownInput.tsx";
import Input from '@/components/ui/Input/Input';
import {useUser} from "@/hooks/useUserStore.ts";
import {Modal} from "antd";
import Button from '@/components/ui/Button/Button';

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
    const [selectedNomenclature, setSelectedNomenclature] = useState<number | undefined>(undefined);
    const [newPrice, setNewPrice] = useState<number>(0);
    const [availableNomenclatures, setAvailableNomenclatures] = useState<{ name: string; value: number }[]>([]);

    const { data: nomenclatureData } = useSWR(
        user.organizationId && isOpen ? [`get-sale-modal`, user.organizationId] : null,
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
                name: item.props.name,
                value: item.props.id,
            }));

            const available = allNomenclatures.filter(nom =>
                !tableData.some(row => row.nomenclatureId === nom.value)
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
                    handleClick={handleCancel}
                />
                <Button
                    title={t('organizations.save')}
                    form={true}
                    isLoading={isLoading}
                    handleClick={handleSubmit}
                    disabled={!selectedNomenclature || newPrice < 0}
                />
            </div>
        </Modal>
    );
}

export default SalePriceModal;