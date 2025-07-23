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
import { Descriptions, Divider, Table } from "antd";
import { usePermissions } from "@/hooks/useAuthStore";
import { Can } from "@/permissions/Can";
import {
    UpOutlined,
    DownOutlined,
    EditOutlined
} from "@ant-design/icons";
import { TFunction } from "i18next";
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';
import { ColumnsType } from "antd/es/table";


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

type EditableCellProps = {
    editable?: boolean;
    dataIndex: string;
    record: TableRow;
    handleInputChange?: (id: number, key: string, value: number) => void;
    children: React.ReactNode;
};

const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    dataIndex,
    record,
    handleInputChange,
    children,
}) => {
    if (!record || !dataIndex) {
        return <td>{children}</td>;
    }

    const value = record[dataIndex as keyof typeof record] as number;

    const onChange: InputNumberProps['onChange'] = (val) => {
        if (handleInputChange) {
            handleInputChange(record.id, dataIndex, val as number);
        }
    };

    if (!editable) return <div>{children}</div>;

    return (
        <td>
            <InputNumber
                value={value}
                onChange={onChange}
                min={0}
                style={{ width: '100%' }}
            />
        </td>
    );
};

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

    const getCollectionDeviceTypeColumns = (
        isDisabled: boolean
    ) => [
            {
                title: 'Тип',
                dataIndex: 'typeName',
                key: 'typeName',
            },
            {
                title: 'Купюры',
                dataIndex: 'sumPaperDeviceType',
                key: 'sumPaperDeviceType',
                editable: !isDisabled,
            },
            {
                title: 'Монеты',
                dataIndex: 'sumCoinDeviceType',
                key: 'sumCoinDeviceType',
                editable: !isDisabled,
            },
            {
                title: 'Сумма всего',
                dataIndex: 'sumFactDeviceType',
                key: 'sumFactDeviceType',
            },
            {
                title: 'Недостача',
                dataIndex: 'shortageDeviceType',
                key: 'shortageDeviceType',
                render: (value: number) => (
                    <div className="text-errorFill">{value}</div>
                ),
            },
            {
                title: 'Безналичная оплата',
                dataIndex: 'virtualSumDeviceType',
                key: 'virtualSumDeviceType',
            },
        ];

    const mergedColumns = getCollectionDeviceTypeColumns(status === t("tables.SENT"))
        .map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: (record: TableRow) => ({
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    record,
                    handleInputChange: handleTableChange,
                }),
            };
        }) as ColumnsType<TableRow>;


    const getDeviceTableColumns = (
        editingRow: number | null,
        setEditingRow: (id: number | null) => void,
        handleDateChange: (
            e: React.ChangeEvent<HTMLInputElement>,
            rowId: number,
            key: string
        ) => void,
        t: TFunction,
        status: string
    ) => [
            {
                title: 'Имя устройства',
                dataIndex: 'deviceName',
                key: 'deviceName',
            },
            {
                title: 'Тип устройства',
                dataIndex: 'deviceType',
                key: 'deviceType',
            },
            {
                title: 'Время сбора (старое)',
                dataIndex: 'oldTookMoneyTime',
                key: 'oldTookMoneyTime',
                render: (text: string) => dayjs(text).format('DD.MM.YYYY HH:mm:ss'),
            },
            {
                title: 'Время сбора (новое)',
                dataIndex: 'tookMoneyTime',
                key: 'tookMoneyTime',
                render: (_: unknown, record: CashCollectionDevice) => {
                    const value = record.tookMoneyTime;
                    if (editingRow === record.id && status !== t("tables.SENT")) {
                        const formatted = value ? dayjs(value).format("YYYY-MM-DDTHH:mm") : "";
                        return (
                            <input
                                type="datetime-local"
                                className="w-full px-2 py-1 border rounded-md"
                                value={formatted}
                                onChange={(e) => handleDateChange(e, record.deviceId, 'tookMoneyTime')}
                                onBlur={() => setEditingRow(null)}
                                autoFocus
                            />
                        );
                    }
                    return (
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                if (status !== t("tables.SENT")) setEditingRow(record.id);
                            }}
                        >
                            {dayjs(value).format('DD.MM.YYYY HH:mm:ss')}
                        </div>
                    );
                },
            },
            {
                title: 'Сумма',
                dataIndex: 'sumDevice',
                key: 'sumDevice',
            },
            {
                title: 'Монеты',
                dataIndex: 'sumCoinDevice',
                key: 'sumCoinDevice',
            },
            {
                title: 'Купюры',
                dataIndex: 'sumPaperDevice',
                key: 'sumPaperDevice',
            },
            {
                title: 'Безналичная сумма',
                dataIndex: 'virtualSumDevice',
                key: 'virtualSumDevice',
            },
            {
                title: '',
                key: 'actions',
                render: (_: unknown, record: CashCollectionDevice) => (
                    <div className="text-primary02 cursor-pointer" onClick={() => {
                        if (status !== t("tables.SENT")) {
                            setEditingRow(record.id);
                        }
                    }}>
                        <EditOutlined />
                    </div>
                ),
            }
        ];

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
                            {openCashColl && <Table
                                dataSource={tableData}
                                columns={mergedColumns}
                                rowKey="id"
                                pagination={false}
                                loading={collectionLoading}
                                scroll={{ x: "max-content" }}
                                components={{
                                    body: {
                                        cell: EditableCell,
                                    },
                                }}
                                summary={() => {
                                    const totalSumFact = tableData.reduce((acc, row) => acc + (row.sumFactDeviceType || 0), 0);
                                    const totalShortage = tableData.reduce((acc, row) => acc + (row.shortageDeviceType || 0), 0);
                                    const totalVirtualSum = tableData.reduce((acc, row) => acc + (row.virtualSumDeviceType || 0), 0);

                                    return (
                                        <Table.Summary fixed>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0}><strong>{t("finance.total")}</strong></Table.Summary.Cell>
                                                <Table.Summary.Cell index={1} />
                                                <Table.Summary.Cell index={2} />
                                                <Table.Summary.Cell index={3}>
                                                    <strong>{totalSumFact}</strong>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={4}>
                                                    <strong>{totalShortage}</strong>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={5}>
                                                    <strong>{totalVirtualSum}</strong>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    );
                                }}
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
                            {openCollDevice && <Table
                                dataSource={deviceData}
                                columns={getDeviceTableColumns(editingRow, setEditingRow, handleDateChange, t, String(status))}
                                rowKey="id"
                                pagination={false}
                                loading={collectionLoading}
                                scroll={{ x: "max-content" }}
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