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
import Icon from "feather-icons-react";
import moment from "moment";

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

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

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

    // const resetForm = () => {
    //     setFormData(defaultValues);
    //     reset();
    // };

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
                // resetForm();
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
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [openCashColl, setOpenCashColl] = useState(false);
    const [openCollDevice, setOpenCollDevice] = useState(false);

    const handleUpdate = (id: number) => {
        console.log("Id of handle update: ", id);
        setEditingRow(id);
    }

    const handleTableChange = (id: number, key: string, value: string | number) => {
        setTableData((prevData) =>
            prevData?.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    const handleDateTimeChange = (value: string, type: string) => {
        setFormData((prev) => {
            const currentDate = prev.cashCollectionDate ? prev.cashCollectionDate.split("T") : ["", ""];
            const updatedDateTime =
                type === "date" ? value + "T" + (currentDate[1] || "00:00") : currentDate[0] + "T" + value;

            const updatedFormData = { ...prev, cashCollectionDate: updatedDateTime };

            setValue("cashCollectionDate", updatedDateTime);

            return updatedFormData;
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: number, key: string) => {
        setDeviceData((prevData) =>
            prevData.map((row) =>
                row.deviceId === rowId ? { ...row, [key]: e.target.value } : row
            )
        );
    };

    return (
        <div className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex space-x-4">
                    <Input
                        type="date"
                        title={t("finance.end")}
                        classname="w-44"
                        value={formData.cashCollectionDate ? formData.cashCollectionDate.split("T")[0] : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "date")}
                        error={!!errors.cashCollectionDate}
                        {...register("cashCollectionDate", { required: "Cash Collection DateTime is required" })}
                        helperText={errors.cashCollectionDate?.message || ""}
                    />
                    <Input
                        type="time"
                        classname="w-32 mt-6"
                        value={formData.cashCollectionDate ? formData.cashCollectionDate.split("T")[1]?.slice(0, 5) : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "time")}
                        error={!!errors.cashCollectionDate}
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
                    {collection && Object.keys(collection).length > 0 && <Button
                        title={t("finance.add")}
                        type="outline"
                        iconDown={showData}
                        iconUp={!showData}
                        handleClick={() => setShowData(!showData)}
                    />}
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
                        <div>
                            <div className="flex items-center space-x-2">
                                <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01" onClick={() => setOpenCashColl(!openCashColl)}>
                                    {openCashColl ? <Icon icon="chevron-up" /> : <Icon icon="chevron-down" />}
                                </div>
                                <div className="text-2xl font-semibold text-text01">{t("finance.cashColl")}</div>
                            </div>
                            {openCashColl && <OverflowTable
                                tableData={tableData}
                                columns={columnsCollections}
                                handleChange={handleTableChange}
                                showTotal={true}
                            />}
                        </div>
                        : <></>
                }
            </div>
            <div>
                {collectionLoading ? (
                    <TableSkeleton columnCount={columnsDeviceData.length} />
                ) :
                    tableData.length > 0 ?
                        <div>
                            <div className="flex items-center space-x-2">
                                <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01" onClick={() => setOpenCollDevice(!openCollDevice)}>
                                    {openCollDevice ? <Icon icon="chevron-up" /> : <Icon icon="chevron-down" />}
                                </div>
                                <div className="text-2xl font-semibold text-text01">{t("finance.collDev")}</div>
                            </div>
                            {openCollDevice && <OverflowTable
                                tableData={deviceData}
                                columns={columnsDeviceData}
                                isUpdateLeft={true}
                                onUpdate={handleUpdate}
                                renderCell={(column, row) => {
                                    if (column.type === "date") {
                                        if (editingRow === row.deviceId) {
                                            const formattedDate = row[column.key]
                                                ? new Date(row[column.key]).toISOString().slice(0, 16) // Convert to 'YYYY-MM-DDTHH:MM'
                                                : "";

                                            return (
                                                <Input
                                                    type="datetime-local"
                                                    value={formattedDate}
                                                    changeValue={(e) => handleDateChange(e, row.deviceId, column.key)}
                                                />
                                            );
                                        } else {
                                            return moment(row[column.key]).format('DD.MM.YYYY HH:mm:ss') || "-";
                                        }
                                    }
                                    return row[column.key] || "-";
                                }}
                            />}
                        </div>
                        : <></>
                }
            </div>
            {collection && Object.keys(collection).length > 0 && <div className="flex space-x-3">
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
            </div>}
        </div>
    )
}

export default CollectionCreation;