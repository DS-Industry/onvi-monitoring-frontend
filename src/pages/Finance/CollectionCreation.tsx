import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import useFormHook from "@/hooks/useFormHook";
import { getPoses } from "@/services/api/equipment";
import { getCollectionById, postCollection, recalculateCollection, returnCollection, sendCollection } from "@/services/api/finance";
import { columnsDeviceData } from "@/utils/OverFlowTableData";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Icon from "feather-icons-react";
import moment from "moment";
import { useCity } from "@/hooks/useAuthStore";
import DynamicTable from "@/components/ui/Table/DynamicTable";

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
    const location = useLocation();
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: collections } = useSWR(location?.state?.ownerId ? [`get-collection`] : null, () => getCollectionById(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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

    const { trigger: returnColl, isMutating: returningColl } = useSWRMutation(location?.state?.ownerId ? ['return-collection'] : null, async () => returnCollection(location.state?.ownerId));

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

    useEffect(() => {
        if (collections && Object.keys(collections).length > 0) {
            setTableData(collections.cashCollectionDeviceType);
            setDeviceData(collections.cashCollectionDevice);
            setCollection(collections);
        } else {
            setTableData([]);
            setDeviceData([]);
            setCollection({} as Collection);
        }
    }, [collections]);

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
                setHideButton(true);
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
    const [showData, setShowData] = useState(true);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [openCashColl, setOpenCashColl] = useState(true);
    const [openCollDevice, setOpenCollDevice] = useState(true);
    const [hideButton, setHideButton] = useState(false);

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
        const inputDate = e.target.value;
        const isoDate = new Date(inputDate).toISOString();

        setDeviceData((prevData) =>
            prevData.map((row) =>
                row.deviceId === rowId ? { ...row, [key]: isoDate } : row
            )
        );
    };

    const { trigger: recalCollection, isMutating } = useSWRMutation(['recal-collection'],
        async (_, { arg }: {
            arg: {
                cashCollectionDeviceData: {
                    cashCollectionDeviceId: number;
                    tookMoneyTime: Date;
                }[]
                cashCollectionDeviceTypeData: {
                    cashCollectionDeviceTypeId: number;
                    sumCoin?: number;
                    sumPaper?: number;
                }[]
            }
        }) => {
            return recalculateCollection(arg, collection.id);
        });

    const { trigger: senCollection, isMutating: sendingColl } = useSWRMutation(['send-collection'],
        async (_, { arg }: {
            arg: {
                cashCollectionDeviceData: {
                    cashCollectionDeviceId: number;
                    tookMoneyTime: Date;
                }[]
                cashCollectionDeviceTypeData: {
                    cashCollectionDeviceTypeId: number;
                    sumCoin?: number;
                    sumPaper?: number;
                }[]
            }
        }) => {
            return sendCollection(arg, collection.id);
        });

    const handleRecalculation = async () => {
        console.log("Final Task Values:", tableData);

        const collectionDeviceType: { cashCollectionDeviceTypeId: number; sumCoin: number; sumPaper: number; }[] = tableData?.map((data) => ({
            cashCollectionDeviceTypeId: data.id,
            sumCoin: Number(data.sumCoinDeviceType),
            sumPaper: Number(data.sumPaperDeviceType)
        })) || [];

        const collectionDevice: { cashCollectionDeviceId: number; tookMoneyTime: Date; }[] = deviceData?.map((data) => ({
            cashCollectionDeviceId: data.id,
            tookMoneyTime: data.tookMoneyTime
        })) || [];

        console.log("Payload for API:", collectionDevice, collectionDeviceType);

        const result = await recalCollection({
            cashCollectionDeviceData: collectionDevice,
            cashCollectionDeviceTypeData: collectionDeviceType
        });

        if (result) {
            console.log("Result of the api: ", result);
            setTableData(result.cashCollectionDeviceType);
            setDeviceData(result.cashCollectionDevice);
            setCollection(result);
        }
    };

    const handleSend = async () => {
        console.log("Final Task Values:", tableData);

        const collectionDeviceType: { cashCollectionDeviceTypeId: number; sumCoin: number; sumPaper: number; }[] = tableData?.map((data) => ({
            cashCollectionDeviceTypeId: data.id,
            sumCoin: Number(data.sumCoinDeviceType),
            sumPaper: Number(data.sumPaperDeviceType)
        })) || [];

        const collectionDevice: { cashCollectionDeviceId: number; tookMoneyTime: Date; }[] = deviceData?.map((data) => ({
            cashCollectionDeviceId: data.id,
            tookMoneyTime: data.tookMoneyTime
        })) || [];

        console.log("Payload for API:", collectionDevice, collectionDeviceType);

        const result = await senCollection({
            cashCollectionDeviceData: collectionDevice,
            cashCollectionDeviceTypeData: collectionDeviceType
        });

        if (result) {
            console.log("Result of the api: ", result);
            setTableData(result.cashCollectionDeviceType);
            setDeviceData(result.cashCollectionDevice);
            setCollection(result);
            navigate("/finance/collection");
        }
    };

    const handleReturn = async () => {
        console.log("Final Task Values:", tableData);

        const result = await returnColl();

        if (result) {
            console.log("Result of the api: ", result);
            navigate("/finance/collection");
        }
    };

    const columnsCollections = [
        {
            label: "Тип",
            key: "typeName"
        },
        {
            label: "Купюры",
            key: "sumPaperDeviceType",
            render: (row: { sumPaperDeviceType: number; id: number; key: string; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
                row.key === "total" ? "" : <Input
                    type="number"
                    // className="border border-opacity01 rounded-md px-3 py-2 w-full bg-background05"
                    placeholder="00,00"
                    value={row.sumPaperDeviceType}
                    //   error={!row.sumPaperDeviceType && location.state?.status !== t("tables.SENT")}
                    //   helperText={!row.sumPaperDeviceType && location.state?.status !== t("tables.SENT") ? "Sum Paper Device type is required." : undefined}
                    changeValue={(e) => handleChange(row.id, "sumPaperDeviceType", e.target.value)}
                    disabled={location.state?.status === t("tables.SENT")}
                />
            ),
        },
        {
            label: "Монеты",
            key: "sumCoinDeviceType",
            render: (row: { sumCoinDeviceType: number; id: number; key: string; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
                row.key === "total" ? "" : <Input
                    type="number"
                    // className="border border-opacity01 rounded-md px-3 py-2 w-full bg-background05"
                    placeholder="00,00"
                    value={row.sumCoinDeviceType}
                    //   error={!row.sumCoinDeviceType && location.state?.status !== t("tables.SENT")}
                    //   helperText={!row.sumCoinDeviceType && location.state?.status !== t("tables.SENT") ? "Sum Coin Device type is required." : undefined}
                    changeValue={(e) => handleChange(row.id, "sumCoinDeviceType", e.target.value)}
                    disabled={location.state?.status === t("tables.SENT")}
                />
            ),
        },
        {
            label: "Сумма всего",
            key: "sumFactDeviceType",
            type: "number"
        },
        {
            label: "Недостача",
            key: "shortageDeviceType",
            type: "number"
        },
        {
            label: "Безналичная оплата",
            key: "virtualSumDeviceType",
            type: "number"
        }
    ]

    return (
        <div className="space-y-6">
            {((location?.state?.status === t("tables.SENT")) || (location?.state?.status === t("tables.SAVED"))) ?
                <></> :
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex space-x-4">
                        <Input
                            type="date"
                            title={t("finance.collDate")}
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
                    {!hideButton && (<div className="flex justify-between">
                        <Button
                            title={t("finance.form")}
                            isLoading={collectionLoading}
                            form={true}
                        />
                    </div>)}
                </form>}
            <div className="flex justify-end">
                {collection && Object.keys(collection).length > 0 && <Button
                    title={t("finance.add")}
                    type="outline"
                    iconUp={showData}
                    iconDown={!showData}
                    handleClick={() => setShowData(!showData)}
                />}
            </div>
            {showData && collection && Object.keys(collection).length > 0 && (
                <div className="flex space-x-20">
                    <div className="text-text01 space-y-4">
                        {[
                            { label: t("finance.no"), value: collection.id },
                            { label: t("marketing.total"), value: `${collection.sumFact || "00"} ₽` },
                            { label: t("finance.cars"), value: collection.countCar },
                            { label: t("finance.cash"), value: `${collection.virtualSum || "00"} ₽` },
                            { label: t("finance.amt"), value: `${collection.sumCard || "00"} ₽` }
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
                            {openCashColl && <DynamicTable
                                data={tableData.sort((a, b) => a.id - b.id)}
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
                            {openCollDevice && <DynamicTable
                                data={deviceData}
                                columns={columnsDeviceData}
                                // isUpdateLeft={true}
                                onEdit={handleUpdate}
                                renderCell={(column, row) => {
                                    if (column.type === "date") {
                                        if (editingRow === row.id && column.key === "tookMoneyTime") {
                                            // Get the original value and ensure it is formatted without conversion to UTC
                                            const originalDate = row[column.key] || "";

                                            // If the originalDate is valid, use it directly in the 'datetime-local' format
                                            const formattedDate = originalDate
                                                ? originalDate.slice(0, 16) // Extract 'YYYY-MM-DDTHH:MM' format
                                                : "";

                                            return (
                                                <input
                                                    type="datetime-local"
                                                    value={formattedDate}
                                                    className="w-full px-3 py-1 rounded-md caret-primary02 text-black border outline-none border-primary02 border-opacity-30 hover:border-primary02"
                                                    onChange={(e) => handleDateChange(e, row.deviceId, column.key)}
                                                    onBlur={() => setEditingRow(null)} // Exit edit mode on blur
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === "Enter" && setEditingRow(null)} // Exit edit mode on Enter
                                                    disabled={location.state?.status === t("tables.SENT")}
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
                {location.state?.status !== t("tables.SENT") && <Button
                    type="outline"
                    title={t("finance.recal")}
                    isLoading={isMutating}
                    form={true}
                    handleClick={handleRecalculation}
                />}
                {location.state?.status !== t("tables.SENT") && <Button
                    title={t("finance.recalSend")}
                    isLoading={sendingColl}
                    form={true}
                    handleClick={handleSend}
                />}
                {location.state?.status === t("tables.SENT") && <Button
                    title={t("finance.refund")}
                    isLoading={returningColl}
                    handleClick={handleReturn}
                />}
            </div>}
        </div>
    )
}

export default CollectionCreation;