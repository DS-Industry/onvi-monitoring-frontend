import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import useFormHook from "@/hooks/useFormHook";
import { getPoses } from "@/services/api/equipment";
import { postCollection } from "@/services/api/finance";
import { columnsCollections, columnsDeviceData } from "@/utils/OverFlowTableData";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

type TableRow = {
    id: number;
    typeName: string;
    sumPaperDeviceType: number;
    sumCoinDeviceType: number;
    sumFactDeviceType: number;
    shortageDeviceType: number;
    virtualSumDeviceType: number;
};

type CashCollectionDevice = {
    id: number;
    deviceId: number;
    deviceName: string;
    deviceType: string;
    oldTookMoneyTime: Date;
    tookMoneyTime: Date;
    sumDevice: number;
    sumCoinDevice: number;
    sumPaperDevice: number;
    virtualSumDevice: number;
}

type Collection = {
    id: number;
    cashCollectionDate: Date;
    oldCashCollectionDate: Date;
    status: string;
    sumFact: number;
    virtualSum: number;
    sumCard: number;
    shortage: number;
    countCar: number;
    countCarCard: number;
    averageCheck: number;
    cashCollectionDeviceType: {
        id: number;
        typeName: string;
        sumCoinDeviceType: number;
        sumPaperDeviceType: number;
        sumFactDeviceType: number;
        shortageDeviceType: number;
        virtualSumDeviceType: number;
    }[];
    cashCollectionDevice: {
        id: number;
        deviceId: number;
        deviceName: string;
        deviceType: string;
        oldTookMoneyTime: Date;
        tookMoneyTime: Date;
        sumDevice: number;
        sumCoinDevice: number;
        sumPaperDevice: number;
        virtualSumDevice: number;
    }[]
}

const CollectionCreation: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues = {
        posId: 0,
        cashCollectionDate: ''
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: postColl, isMutating: collectionLoading } = useSWRMutation(['post-collection'], async () => postCollection({
        cashCollectionDate: new Date(formData.cashCollectionDate),
        posId: formData.posId
    }));

    type FieldType = "posId" | "cashCollectionDate";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['posId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
    };

    const onSubmit = async (data: unknown) => {
        console.log('Form data:', data);

        try {
            const result = await postColl();
            console.log(result);
            if (result) {
                console.log(result);
                setTableData(result.cashCollectionDeviceType);
                setDeviceData(result.cashCollectionDevice);
                setCollection(result);
                resetForm();
            } else {
                throw new Error('Invalid update data.');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    }

    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [deviceData, setDeviceData] = useState<CashCollectionDevice[]>([]);
    const [collection, setCollection] = useState<Collection>({} as Collection);
    const [showData, setShowData] = useState(false);

    const handleTableChange = (id: number, key: string, value: string | number) => {
        setTableData((prevData) =>
            prevData?.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    return (
        <div className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex space-x-4">
                    <Input
                        type="date"
                        title={t("finance.begin")}
                        classname="w-44"
                        disabled={true}
                    />
                    <Input
                        type="date"
                        title={t("finance.end")}
                        classname="w-44"
                        value={formData.cashCollectionDate}
                        changeValue={(e) => handleInputChange('cashCollectionDate', e.target.value)}
                        error={!!errors.cashCollectionDate}
                        {...register('cashCollectionDate', { required: 'Start Date is required' })}
                        helperText={errors.cashCollectionDate?.message || ''}
                    />
                </div>
                <DropdownInput
                    title={t("finance.carWash")}
                    options={poses}
                    classname="w-64"
                    {...register('posId', {
                        required: 'Pos ID is required',
                        validate: (value) =>
                            (value !== 0) || "Pos ID is required"
                    })}
                    value={formData.posId}
                    onChange={(value) => handleInputChange('posId', value)}
                    error={!!errors.posId}
                    helperText={errors.posId?.message}
                />
                <div className="flex justify-between">
                    <Button
                        title={t("finance.form")}
                        isLoading={collectionLoading}
                        form={true}
                    />
                    <Button
                        title={t("finance.add")}
                        type="outline"
                        iconDown={showData}
                        iconUp={!showData}
                        handleClick={() => setShowData(!showData)}
                    />
                </div>
            </form>
            {showData && collection && Object.keys(collection).length > 0 && (
                <div className="flex space-x-20">
                    <div className="text-text01 space-y-4">
                        {[
                            { label: t("finance.no"), value: collection.id },
                            { label: t("marketing.total"), value: `${collection.sumFact || "00"} ₽` },
                            { label: t("finance.cars"), value: collection.countCar },
                            { label: t("finance.cash"), value: `${collection.virtualSum || "00"} ₽` },
                            { label: t("finance.amt"), value: `${collection.sumCard || "00"} ₽` },
                            { label: t("finance.nos"), value: collection.countCarCard }
                        ].map((item, index) => (
                            <div key={index} className="grid grid-cols-2 gap-10">
                                <div>{item.label}</div>
                                <div className="text-lg font-semibold text-right">{item.value}</div>
                            </div>
                        ))}
                    </div>
                    <div className="text-text01 space-y-4">
                        {[
                            { label: t("finance.short"), value: `${collection.shortage || "00"} ₽` },
                            { label: t("marketing.avg"), value: `${collection.averageCheck || "00"} ₽` }
                        ].map((item, index) => (
                            <div key={index} className="grid grid-cols-2 gap-20">
                                <div>{item.label}</div>
                                <div className="text-lg font-semibold text-right">{item.value}</div>
                            </div>
                        ))}
                    </div>

                </div>
            )}
            <div>
                {collectionLoading ? (
                    <TableSkeleton columnCount={columnsCollections.length} />
                ) :
                    tableData.length > 0 ?
                        <OverflowTable
                            tableData={tableData}
                            columns={columnsCollections}
                            handleChange={handleTableChange}
                            showTotal={true}
                        />
                        : <></>
                }
            </div>
            <div>
                {collectionLoading ? (
                    <TableSkeleton columnCount={columnsDeviceData.length} />
                ) :
                    tableData.length > 0 ?
                        <OverflowTable
                            tableData={deviceData}
                            columns={columnsDeviceData}
                        />
                        : <></>
                }
            </div>
            <div className="flex space-x-3">
                            <Button
                                type="outline"
                                title={t("organizations.cancel")}
                                handleClick={() => navigate('/finance/collection')}
                            />
                            <Button
                                type="outline"
                                title={t("warehouse.saveDraft")}
                                form={true}
                            />
                            <Button
                                title={t("warehouse.saveAccept")}
                                form={true}
                            />
                        </div>
        </div>
    )
}

export default CollectionCreation;