import React, { ClassAttributes, ThHTMLAttributes, useState } from "react";
import { EditOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { usePermissions } from "@/hooks/useAuthStore";
import { Can } from "@/permissions/Can";
import type { ColumnsType } from "antd/es/table";
import Table from "antd/es/table";
import Button from "antd/es/button";

interface TableColumn {
    label: string;
    key: string;
    type?: "date" | "string" | "number" | string;
}

type TreeData = {
    id: number;
    name: string;
    description?: string;
    children?: TreeData[];
    isExpanded?: boolean;
    [key: string]: unknown;
};

type Props = {
    treeData: TreeData[];
    columns: TableColumn[];
    isUpdate?: boolean;
    isDisplayEdit?: boolean;
    onUpdate?: (id: number) => void;
    handleChange?: (id: number, key: string, value: string | number) => void;
    headerBgColor?: string;
};

const DynamicTreeTable: React.FC<Props> = ({
    treeData,
    columns,
    isUpdate,
    onUpdate,
    headerBgColor = "#E4F0FF"
}: Props) => {
    const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
    const userPermissions = usePermissions();

    const handleExpand = (id: number) => {
        setExpandedRowKeys((prev) =>
            prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
        );
    };

    const generateColumns = (): ColumnsType<TreeData> => {
        // Expand/Collapse Column (First Column)
        const expandColumn = {
            title: "", // Empty title for cleaner UI
            dataIndex: "expand",
            key: "expand",
            width: 50, // Small width to keep it compact
            render: (_: unknown, record: TreeData) => (
                record.children && record.children.length > 0 ? (
                    <Button
                        type="text"
                        size="small"
                        icon={expandedRowKeys.includes(record.id) ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
                        onClick={() => handleExpand(record.id)}
                    />
                ) : null
            ),
        };

        // Data Columns (Middle Columns)
        const dataColumns = columns.map((col, index) => ({
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            render: (value: unknown, record: TreeData): React.ReactNode => {
                // Only apply indent to the first column
                if (index === 0) {
                    const level = record._level ?? 0;
                    return (
                        <div style={{ paddingLeft: (typeof level === "number" ? level : 0) * 20 }}>
                            {typeof value === "string" || typeof value === "number" ? value : String(value)}
                        </div>
                    );
                }
                // Ensure always returning ReactNode
                if (typeof value === "string" || typeof value === "number") {
                    return value;
                }
                if (value === undefined || value === null) {
                    return "";
                }
                return String(value);
            }
        }));

        // Actions Column (Last Column)
        const actionColumn = {
            title: "",
            dataIndex: "actions",
            key: "actions",
            width: 80, // Ensure it's at the end
            render: (_: unknown, record: TreeData) => (
                <Can
                    requiredPermissions={[
                        { action: "manage", subject: "Warehouse" },
                        { action: "update", subject: "Warehouse" },
                    ]}
                    userPermissions={userPermissions}
                >
                    {(allowed) =>
                        allowed &&
                        isUpdate && (
                            <Button type="link"
                                icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
                                onClick={() => onUpdate && onUpdate(record.id)}
                            />
                        )
                    }
                </Can>
            ),
        };

        return [expandColumn, ...dataColumns, actionColumn]; // Order: Expand Button → Data Columns → Edit Button
    };

    // Function to format data and include expanded state
    const formatData = (data: TreeData[], level: number = 0): TreeData[] => {
        return data.reduce<TreeData[]>((acc, item) => {
            acc.push({
                ...item,
                key: item.id,
                _level: level
            });

            // Add children only if this row is expanded
            if (expandedRowKeys.includes(item.id) && item.children) {
                acc.push(...formatData(item.children, level + 1));
            }

            return acc;
        }, []);
    };

    return (
        <Table
            columns={generateColumns()}
            dataSource={formatData(treeData)}
            pagination={false}
            expandable={{ expandIcon: () => null }}
            components={{
                header: {
                    cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableHeaderCellElement> & ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                        <th
                            {...props}
                            style={{ backgroundColor: headerBgColor, fontWeight: "semi-bold", paddingLeft: "9px", paddingTop: "20px", paddingBottom: "20px", textAlign: "left", borderRadius: "0px" }}
                            className="border-b border-[1px] border-background02 bg-background06 px-2.5 text-left text-sm font-semibold text-text01 tracking-wider"
                        />
                    ),
                },
                body: {
                    cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableDataCellElement> & ThHTMLAttributes<HTMLTableDataCellElement>) => (
                        <td
                            {...props}
                            style={{ paddingLeft: "9px", paddingTop: "10px", paddingBottom: "10px" }}
                        />
                    ),
                },

            }}
            scroll={{ x: "max-content" }}
        />
    );
};

export default DynamicTreeTable;
