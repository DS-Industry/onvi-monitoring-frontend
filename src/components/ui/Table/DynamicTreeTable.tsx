import React, { ClassAttributes, ThHTMLAttributes, useState } from "react";
import { Table, Button } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined, EditOutlined } from "@ant-design/icons";
import { usePermissions } from "@/hooks/useAuthStore";
import { Can } from "@/permissions/Can";
import type { ColumnsType } from "antd/es/table";

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
    [key: string]: any;
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
        const actionColumn = {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (_: any, record: TreeData) => (
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
                                onClick={() => onUpdate && onUpdate(record.id)}>
                            </Button>
                        )
                    }
                </Can>
            ),
        };

        return isUpdate
            ? [actionColumn, ...columns.map((col) => ({ title: col.label, dataIndex: col.key, key: col.key }))]
            : columns.map((col) => ({ title: col.label, dataIndex: col.key, key: col.key }));
    };

    const formatData = (data: TreeData[], level: number = 0): (TreeData & { displayName: JSX.Element })[] => {
        return data.map((item) => ({
            ...item,
            key: item.id,
            children: item.children ? formatData(item.children, level + 1) : undefined,
            expanded: expandedRowKeys.includes(item.id),
            name: item.name,
            displayName: (
                <div style={{ paddingLeft: `${level * 20}px`, display: "flex", alignItems: "center" }}>
                    {item.children && item.children.length > 0 && (
                        <Button
                            type="text"
                            size="small"
                            icon={expandedRowKeys.includes(item.id) ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
                            onClick={() => handleExpand(item.id)}
                        />
                    )}
                    {item.name}
                </div>
            ),
        }));
    };    

    return (
        <Table
            columns={generateColumns()}
            dataSource={formatData(treeData)}
            pagination={false}
            expandable={{
                expandedRowKeys,
                onExpand: (_expanded, record) => handleExpand(record.id),
            }}
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
    );
};

export default DynamicTreeTable;
