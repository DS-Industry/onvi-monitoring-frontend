// components/Collection/CollectionDeviceTable.tsx
import React, { useState } from "react";
import { Table, Popconfirm, Typography, Button as AntButton } from "antd";
import { TFunction } from "i18next";
import dayjs from "dayjs";
import { EditOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { getCurrencyRender } from "@/utils/tableUnits";

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

type Props = {
    deviceData: CashCollectionDevice[];
    editingRow: number | null;
    setEditingRow: (id: number | null) => void;
    handleDateChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        rowId: number,
        key: string
    ) => void;
    status: string;
    t: TFunction;
    loading: boolean;
};

const CollectionDeviceTable: React.FC<Props> = ({
    deviceData,
    editingRow,
    setEditingRow,
    handleDateChange,
    status,
    t,
    loading,
}) => {
    const [editingValue, setEditingValue] = useState<string>("");

    const startEditing = (record: CashCollectionDevice) => {
        setEditingRow(record.id);
        const date = record.tookMoneyTime;
        setEditingValue(date ? dayjs(date).format("YYYY-MM-DDTHH:mm") : "");
    };

    const cancelEditing = () => {
        setEditingRow(null);
    };

    const saveEditing = (record: CashCollectionDevice) => {
        const fakeEvent = {
            target: { value: editingValue }
        } as React.ChangeEvent<HTMLInputElement>;
        handleDateChange(fakeEvent, record.deviceId, "tookMoneyTime");
        setEditingRow(null);
    };

    const columns = [
        {
            title: t("Имя устройства"),
            dataIndex: "deviceName",
            key: "deviceName",
            width: '10%',
        },
        {
            title: t("Тип устройства"),
            dataIndex: "deviceType",
            key: "deviceType",
            width: '10%',
        },
        {
            title: t("Время сбора (старое)"),
            dataIndex: "oldTookMoneyTime",
            key: "oldTookMoneyTime",
            width: '12%',
            render: (text: string) => dayjs(text).format("DD.MM.YYYY HH:mm:ss"),
        },
        {
            title: t("Время сбора (новое)"),
            dataIndex: "tookMoneyTime",
            key: "tookMoneyTime",
            width: '15%',
            render: (_: unknown, record: CashCollectionDevice) => {
                const date = record.tookMoneyTime;
                const isEditable = editingRow === record.id && status !== t("tables.SENT");

                return isEditable ? (
                    <input
                        type="datetime-local"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="w-full px-2 py-1 border rounded-md"
                        autoFocus
                    />
                ) : (
                    <div
                        className="cursor-pointer"
                        onClick={() => {
                            if (status !== t("tables.SENT")) startEditing(record);
                        }}
                    >
                        {dayjs(date).format("DD.MM.YYYY HH:mm:ss")}
                    </div>
                );
            },
        },
        {
            title: t("Сумма"),
            dataIndex: "sumDevice",
            key: "sumDevice",
            width: '10%',
            render: getCurrencyRender()
        },
        {
            title: t("Монеты"),
            dataIndex: "sumCoinDevice",
            key: "sumCoinDevice",
            width: '11%',
            render: getCurrencyRender()
        },
        {
            title: t("Купюры"),
            dataIndex: "sumPaperDevice",
            key: "sumPaperDevice",
            width: '11%',
            render: getCurrencyRender()
        },
        {
            title: t("Безналичная сумма"),
            dataIndex: "virtualSumDevice",
            key: "virtualSumDevice",
            width: '11%',
            render: getCurrencyRender()
        },
        {
            title: "",
            key: "actions",
            width: '10%',
            render: (_: unknown, record: CashCollectionDevice) => {
                if (editingRow === record.id && status !== t("tables.SENT")) {
                    return (
                        <span>
                            <AntButton
                                type="text"
                                icon={<CheckOutlined />}
                                onClick={() => saveEditing(record)}
                                style={{ marginRight: 8, color: "green" }}
                            />
                            <Popconfirm
                                title={`${t("common.discardChanges")}?`}
                                onConfirm={cancelEditing}
                                okText={t("equipment.yes")}
                                cancelText={t("equipment.no")}
                            >
                                <AntButton
                                    type="text"
                                    icon={<CloseOutlined />}
                                    style={{ color: "red" }}
                                />
                            </Popconfirm>
                        </span>
                    );
                }
                return (
                    <Typography.Link
                        disabled={editingRow !== null || status === t("tables.SENT")}
                        onClick={() => startEditing(record)}
                    >
                        <EditOutlined />
                    </Typography.Link>
                );
            },
        },
    ];

    return (
        <Table
            dataSource={deviceData}
            columns={columns}
            rowKey="id"
            pagination={false}
            loading={loading}
            scroll={{ x: "max-content" }}
        />
    );
};

export default CollectionDeviceTable;
