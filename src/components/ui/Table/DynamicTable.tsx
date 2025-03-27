import { Table, Button, Tooltip, Tag } from "antd";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ClassAttributes, ThHTMLAttributes } from "react";
import { JSX } from "react/jsx-runtime";
import { usePageNumber } from "@/hooks/useAuthStore";
import { useTranslation } from "react-i18next";

interface TableColumn {
    label: string;
    key: string;
    type?: "date" | "string" | "number" | string;
    render?: any;
}

interface EnhancedTableColumn {
    title: string;
    dataIndex: string;
    key: string;
    type?: "date" | "string" | "number" | string;
    render?: any;
}

type Props<T> = {
    data: T[];
    columns: TableColumn[];
    tableTitle?: string;
    rowKey?: keyof T;
    onEdit?: (id: number) => void;
    navigableFields?: { key: keyof T; getPath: (record: T) => string }[];
    headerBgColor?: string; // New prop for header background color
    isCheck?: boolean;
};

type TableRow = {
    id: number;
    name?: string;
    status?: string;
    type?: string;
    startWorkDate?: string | Date;
    endSpecifiedDate?: string | Date;
};


const DynamicTable = <T extends TableRow>({
    data,
    columns,
    tableTitle,
    rowKey = "id",
    onEdit,
    navigableFields = [],
    headerBgColor = "#E4F0FF", // Default header background color
    isCheck = false
}: Props<T>) => {
    const navigate = useNavigate();
    const pageNumber = usePageNumber();
    const { t } = useTranslation();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const getStatusTag = (status: string) => {
        if (status === t("tables.FINISHED") || status === t("tables.ACTIVE"))
            return <Tag color="green">{status}</Tag>;
        if (status === t("tables.OVERDUE"))
            return <Tag color="red">{status}</Tag>;
        if (status === t("tables.SAVED"))
            return <Tag color="orange">{status}</Tag>;
        else return <Tag color="default">{status}</Tag>;
    };

    const enhancedColumns: EnhancedTableColumn[] = columns.map(({ label, key, type, render }) => {
        const navigableField = navigableFields.find((nf) => nf.key === key);

        return {
            title: label,
            dataIndex: key,
            key,
            type,
            render: (value: any, record: T) => {
                // If column is 'status', show tags
                if (key === "status") {
                    return getStatusTag(value);
                }

                if(type === "date") {
                    return new Date(value).toLocaleString("ru-RU", {
                        timeZone: userTimezone,
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                }

                return navigableField ? (
                    <span
                        className="text-primary02 cursor-pointer hover:underline"
                        onClick={() => navigate(navigableField.getPath(record), { state: { ownerId: record.id, name: record.name, status: record.status, type: record.type, workDate: record.startWorkDate, endDate: record.endSpecifiedDate } })}
                    >
                        {value}
                    </span>
                ) : render ? render(value, record) : value;
            },
        };
    });

    if (onEdit) {
        enhancedColumns.push({
            title: "",
            dataIndex: "actions",
            key: "actions",
            render: (_: any, record: T) => (
                <Tooltip title="Редактировать">
                    <Button
                        type="text"
                        icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
                        onClick={() => onEdit(record.id)}
                    />
                </Tooltip>
            ),
        });
    }

    if (isCheck) {
        enhancedColumns.unshift({
            title: "",
            dataIndex: "statusCheck",
            key: "statusCheck",
            render: (_: any, record: T) =>
                record.status === t("tables.FINISHED") ? (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : null, // Show nothing if status is not "FINISHED"
        });
    }

    return (
        <div>
            {tableTitle && <h2 className="text-lg font-semibold mb-4">{tableTitle}</h2>}
            <Table
                columns={enhancedColumns}
                dataSource={data}
                rowKey={rowKey as string}
                pagination={{ pageSize: pageNumber }}
                tableLayout="fixed"
                components={{
                    header: {
                        cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableHeaderCellElement> & ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                            <th
                                {...props}
                                style={{ backgroundColor: headerBgColor, fontWeight: "bold", paddingTop: "30px", paddingBottom: "30px", textAlign: "center", borderRadius: "0px" }}
                                className="border-b border-x-2 border-background02 bg-background06 px-2.5 text-center text-sm font-semibold text-text01 uppercase tracking-wider"
                            />
                        ),
                    }
                }}
                scroll={{ x: "max-content" }}
            />
        </div>
    );
};

export default DynamicTable;
