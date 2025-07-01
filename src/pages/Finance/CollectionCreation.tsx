import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
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
import { useCity } from "@/hooks/useAuthStore";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import DateTimeInput from "@/components/ui/Input/DateTimeInput";
import dayjs from "dayjs";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { Descriptions, Divider } from "antd";

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

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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

    const onSubmit = async () => {
        try {
            const result = await postColl();
            if (result) {
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
        setEditingRow(id);
    }

    const handleTableChange = (id: number, key: string, value: string | number) => {
        setTableData((prevData) =>
            prevData?.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
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

        const collectionDeviceType: { cashCollectionDeviceTypeId: number; sumCoin: number; sumPaper: number; }[] = tableData?.map((data) => ({
            cashCollectionDeviceTypeId: data.id,
            sumCoin: Number(data.sumCoinDeviceType),
            sumPaper: Number(data.sumPaperDeviceType)
        })) || [];

        const collectionDevice: { cashCollectionDeviceId: number; tookMoneyTime: Date; }[] = deviceData?.map((data) => ({
            cashCollectionDeviceId: data.id,
            tookMoneyTime: data.tookMoneyTime
        })) || [];

        const result = await recalCollection({
            cashCollectionDeviceData: collectionDevice,
            cashCollectionDeviceTypeData: collectionDeviceType
        });

        if (result) {
            setTableData(result.cashCollectionDeviceType);
            setDeviceData(result.cashCollectionDevice);
            setCollection(result);
        }
    };

    const handleSend = async () => {
        const collectionDeviceType: { cashCollectionDeviceTypeId: number; sumCoin: number; sumPaper: number; }[] = tableData?.map((data) => ({
            cashCollectionDeviceTypeId: data.id,
            sumCoin: Number(data.sumCoinDeviceType),
            sumPaper: Number(data.sumPaperDeviceType)
        })) || [];

        const collectionDevice: { cashCollectionDeviceId: number; tookMoneyTime: Date; }[] = deviceData?.map((data) => ({
            cashCollectionDeviceId: data.id,
            tookMoneyTime: data.tookMoneyTime
        })) || [];

        const result = await senCollection({
            cashCollectionDeviceData: collectionDevice,
            cashCollectionDeviceTypeData: collectionDeviceType
        });

        if (result) {
            setTableData(result.cashCollectionDeviceType);
            setDeviceData(result.cashCollectionDevice);
            setCollection(result);
            navigate("/finance/collection");
        }
    };

    const handleReturn = async () => {
        const result = await returnColl();

        if (result) {
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
                row.key === "total" ? "" :
                    <Input
                        type="number"
                        label="00,00"
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
                row.key === "total" ? "" :
                    <Input
                        type="number"
                        label="00,00"
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
                        <DateTimeInput
                            title={t("finance.start") + "*"}
                            value={formData.cashCollectionDate ? dayjs(formData.cashCollectionDate) : undefined}
                            changeValue={(date) =>
                                handleInputChange("cashCollectionDate", date ? date.format("YYYY-MM-DDTHH:mm") : "")
                            }
                            error={!!errors.cashCollectionDate}
                            helperText={errors.cashCollectionDate?.message || ""}
                            {...register("cashCollectionDate", { required: "Cash Collection Date is required" })}
                            classname="w-64"
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
                <>
                    <Descriptions
                        title={""}
                        column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
                        labelStyle={{ fontWeight: 500 }}
                        contentStyle={{ textAlign: "right", fontSize: "16px", fontWeight: "bold" }}
                    >
                        <Descriptions.Item label={t("finance.no")}>{collection.id}</Descriptions.Item>
                        <Descriptions.Item label={t("marketing.total")}>{`${collection.sumFact || "00"} ₽`}</Descriptions.Item>
                        <Descriptions.Item label={t("finance.cars")}>{collection.countCar || 0}</Descriptions.Item>
                        <Descriptions.Item label={t("finance.cash")}>{`${collection.virtualSum || "00"} ₽`}</Descriptions.Item>
                        <Descriptions.Item label={t("finance.amt")}>{`${collection.sumCard || "00"} ₽`}</Descriptions.Item>
                        <Descriptions.Item label={t("finance.short")}>{`${collection.shortage || "00"} ₽`}</Descriptions.Item>
                        <Descriptions.Item label={t("marketing.avg")}>{`${collection.averageCheck || "00"} ₽`}</Descriptions.Item>
                    </Descriptions>

                    <Divider />
                </>
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
                                tableData={tableData.sort((a, b) => a.id - b.id)}
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
                                            return dayjs(row[column.key]).format('DD.MM.YYYY HH:mm:ss') || "-";
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