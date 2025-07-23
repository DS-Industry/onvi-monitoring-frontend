import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useFormHook from "@/hooks/useFormHook";
import { getPoses } from "@/services/api/equipment";
import { getCollectionById, postCollection, recalculateCollection, returnCollection, sendCollection } from "@/services/api/finance";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useCity } from "@/hooks/useAuthStore";
import DateTimeInput from "@/components/ui/Input/DateTimeInput";
import dayjs from "dayjs";
import { Descriptions, Divider } from "antd";
import { usePermissions } from "@/hooks/useAuthStore";
import { Can } from "@/permissions/Can";
import {
    UpOutlined,
    DownOutlined} from "@ant-design/icons";
import CashCollectionDeviceTypeTable from "@/pages/Finance/CashCollectionDeviceTypeTable";
import CollectionDeviceTable from "@/pages/Finance/CollectionDeviceTable";

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
    const [searchParams] = useSearchParams();
    const city = useCity();
    const userPermissions = usePermissions();
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: collections } = useSWR(id ? [`get-collection`] : null, () => getCollectionById(Number(id)), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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

    const { trigger: returnColl, isMutating: returningColl } = useSWRMutation(id ? ['return-collection'] : null, async () => returnCollection(Number(id)));

    type FieldType = "posId" | "cashCollectionDate";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['posId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

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

    return (
        <div className="space-y-6">
            {((status === t("tables.SENT")) || (status === t("tables.SAVED"))) ?
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
                {
                    tableData.length > 0 ?
                        <div>
                            <div className="flex items-center space-x-2">
                                <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01 flex items-center justify-center" onClick={() => setOpenCashColl(!openCashColl)}>
                                    {openCashColl ? <UpOutlined /> : <DownOutlined />}
                                </div>
                                <div className="text-2xl font-semibold text-text01">{t("finance.cashColl")}</div>
                            </div>
                            {openCashColl && <CashCollectionDeviceTypeTable
                                tableData={tableData}
                                status={String(status)}
                                t={t}
                                handleTableChange={handleTableChange}
                                loading={collectionLoading}
                            />}
                        </div>
                        : <></>
                }
            </div>
            <div>
                {
                    tableData.length > 0 ?
                        <div>
                            <div className="flex items-center space-x-2">
                                <div className="cursor-pointer bg-background03 w-6 h-6 rounded text-text01 flex items-center justify-center" onClick={() => setOpenCollDevice(!openCollDevice)}>
                                    {openCollDevice ? <UpOutlined /> : <DownOutlined />}
                                </div>
                                <div className="text-2xl font-semibold text-text01">{t("finance.collDev")}</div>
                            </div>
                            {openCollDevice && <CollectionDeviceTable
                                deviceData={deviceData}
                                editingRow={editingRow}
                                setEditingRow={setEditingRow}
                                handleDateChange={handleDateChange}
                                status={String(status)}
                                t={t}
                                loading={collectionLoading}
                            />
                            }
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
                <Can
                    requiredPermissions={[
                        { action: "manage", subject: "CashCollection" },
                        { action: "create", subject: "CashCollection" },
                    ]}
                    userPermissions={userPermissions}
                >
                    {(allowed) => allowed && status !== t("tables.SENT") && <Button
                        type="outline"
                        title={t("finance.recal")}
                        isLoading={isMutating}
                        form={true}
                        handleClick={handleRecalculation}
                    />}
                </Can>
                <Can
                    requiredPermissions={[
                        { action: "manage", subject: "CashCollection" },
                        { action: "create", subject: "CashCollection" },
                    ]}
                    userPermissions={userPermissions}
                >
                    {(allowed) => allowed && status !== t("tables.SENT") && <Button
                        title={t("finance.recalSend")}
                        isLoading={sendingColl}
                        form={true}
                        handleClick={handleSend}
                    />}
                </Can>
                <Can
                    requiredPermissions={[
                        { action: "manage", subject: "CashCollection" },
                        { action: "update", subject: "CashCollection" },
                    ]}
                    userPermissions={userPermissions}
                >
                    {(allowed) => allowed && status === t("tables.SENT") && <Button
                        title={t("finance.refund")}
                        isLoading={returningColl}
                        handleClick={handleReturn}
                    />}
                </Can>
            </div>}
        </div>
    )
}

export default CollectionCreation;