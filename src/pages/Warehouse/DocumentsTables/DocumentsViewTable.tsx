import React, { ClassAttributes, ThHTMLAttributes } from "react";
import Table from "antd/es/table";
import Card from "antd/es/card";

interface TableRow {
    id: number;
}

interface ColumnConfig {
    title: string;
    dataIndex: string;
    key: string;
}

type Props = {
    tableData: TableRow[];
    columns: ColumnConfig[];
    documentName?: string;
    documentTime?: string;
};

const DocumentsViewTable: React.FC<Props> = ({
    tableData,
    columns,
    documentName,
    documentTime,
}) => {

    return (
        <div className="py-6 bg-white rounded-lg font-sans">
            <Card>
                <div className="flex flex-wrap gap-2 text-text02 font-semibold p-4">
                    <div>{documentName}</div>
                    <div>{documentTime}</div>
                </div>

                <div className="w-full overflow-x-auto">
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        components={{
                            header: {
                                cell: (
                                    props: JSX.IntrinsicAttributes &
                                        ClassAttributes<HTMLTableHeaderCellElement> &
                                        ThHTMLAttributes<HTMLTableHeaderCellElement>
                                ) => (
                                    <th
                                        {...props}
                                        style={{
                                            backgroundColor: "#E4F0FF",
                                            fontWeight: "bold",
                                            paddingTop: "30px",
                                            paddingBottom: "30px",
                                            textAlign: "start",
                                            borderRadius: "0px",
                                        }}
                                        className="border-b border-x-2 border-background02 bg-background06 px-2.5 text-center text-sm font-semibold text-text01 uppercase tracking-wider"
                                    />
                                ),
                            },
                        }}
                        scroll={{ x: "max-content" }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default DocumentsViewTable;
