import React, { ClassAttributes, ThHTMLAttributes, useState } from "react";
import { Table, Button, Card } from "antd";
import { useTranslation } from "react-i18next";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

interface TableRow {
    id: number;
    [key: string]: any;
}

interface ColumnConfig {
    key: string;
    label: string;
    isEditable?: boolean;
    type?: "string" | "number" | "checkbox" | "date" | string;
    options?: { name: string; value: any }[];
    render?: any;
}

type Props = {
    tableData: TableRow[];
    columns: ColumnConfig[];
    handleChange?: (id: number, key: string, value: string | number) => void;
    addRow?: () => void;
    addProduct?: () => void;
    showDocument?: boolean;
    documentName?: string;
    documentTime?: string;
    deleteRow?: () => void;
    sortAscending?: () => void;
    sortDescending?: () => void;
};

const GoodsAntTable: React.FC<Props> = ({
    tableData,
    columns,
    handleChange,
    addRow,
    addProduct,
    showDocument,
    documentName,
    documentTime,
    deleteRow,
    sortAscending,
    sortDescending
}) => {
    const { t } = useTranslation();
    const [activeTab] = useState("tab1");

    const formattedColumns = columns.map((column) => ({
        title: column.label,
        dataIndex: column.key,
        key: column.key,
        render: (value: any, row: any) =>
            column.render ? column.render(row, handleChange) : value,
    }));

    return (
        <div className="p-4 bg-white rounded-lg font-sans">
            {activeTab === "tab1" && (
                <Card>
                    {!showDocument ? (
                        <div className="flex justify-between p-4">
                            <div className="space-x-2">
                                <Button onClick={addProduct}>{t("roles.addPro")}</Button>
                                <Button onClick={addRow}>{t("routes.add")}</Button>
                                <Button onClick={deleteRow} danger>{t("marketing.delete")}</Button>
                            </div>
                            <div className="space-x-2">
                                <Button onClick={sortAscending} icon={<ArrowUpOutlined />} />
                                <Button onClick={sortDescending} icon={<ArrowDownOutlined />} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex space-x-3 text-text02 font-semibold p-4">
                            <div>{documentName}</div>
                            <div>{documentTime}</div>
                        </div>
                    )}

                    <Table
                        dataSource={tableData}
                        columns={formattedColumns}
                        rowKey="id"
                        pagination={false}
                        components={{
                            header: {
                                cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableHeaderCellElement> & ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                                    <th
                                        {...props}
                                        style={{ backgroundColor: "#E4F0FF", fontWeight: "bold", paddingTop: "30px", paddingBottom: "30px", textAlign: "center", borderRadius: "0px" }}
                                        className="border-b border-x-2 border-background02 bg-background06 px-2.5 text-center text-sm font-semibold text-text01 uppercase tracking-wider"
                                    />
                                ),
                            }
                        }}
                        scroll={{ x: "max-content" }}
                    />
                </Card>
            )}
        </div>
    );
};

export default GoodsAntTable;
