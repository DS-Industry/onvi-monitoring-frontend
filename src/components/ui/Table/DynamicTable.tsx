import { Table, Button, Tooltip } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ClassAttributes, ThHTMLAttributes } from "react";
import { JSX } from "react/jsx-runtime";
import { usePageNumber } from "@/hooks/useAuthStore";

type Props<T> = {
    data: T[];
    columns: any[];
    tableTitle?: string;
    rowKey?: keyof T;
    onEdit?: (id: number) => void;
    navigableFields?: { key: keyof T; getPath: (record: T) => string }[];
    headerBgColor?: string; // New prop for header background color
};

const DynamicTable = <T extends { id: number }>({
    data,
    columns,
    tableTitle,
    rowKey = "id",
    onEdit,
    navigableFields = [],
    headerBgColor = "#E4F0FF", // Default header background color
}: Props<T>) => {
    const navigate = useNavigate();
    const pageNumber = usePageNumber();

    const enhancedColumns = [
        ...columns.map((col) => {
            const navigableField = navigableFields.find((nf) => nf.key === col.dataIndex);
            if (navigableField) {
                return {
                    ...col,
                    render: (value: any, record: T) => (
                        <span
                            className="text-primary02 cursor-pointer hover:underline"
                            onClick={() => navigate(navigableField.getPath(record),{ state: { ownerId: record.id }})}
                        >
                            {value}
                        </span>
                    ),
                };
            }
            return col;
        }),
        onEdit
            ? {
                title: "",
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
            }
            : null,
    ].filter(Boolean);

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
