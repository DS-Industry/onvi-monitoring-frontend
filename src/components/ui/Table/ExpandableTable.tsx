import { useFilterOn } from '@/components/context/useContext';
import { useCurrentPage, useSetCurrentPage, usePageNumber, usePageSize } from '@/hooks/useAuthStore';
import TableUtils from "@/utils/TableUtils.tsx";
import { ClassAttributes, ThHTMLAttributes } from 'react';
import { ArrowUpOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from "antd/es/table";
import Tag from "antd/es/tag";
import type { TablePaginationConfig } from 'antd/es/table';

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
    titleData: { title: string; }[];
    navigableFields?: { key: keyof T; getPath: (record: T) => string }[];
    titleColumns: TableColumn[];
    showPagination?: boolean;
    handleChange?: (id: number, key: string, value: string | number) => void;
    // New props for pagination control
    onPageChange?: (page: number, pageSize: number) => void;
    loading?: boolean;
}

type TableRow = {
    paperTypeType: string;
    deviceId: number;
    id: number | string;
    name?: string;
    status?: string;
    type?: string;
};

const ExpandableTable = <T extends TableRow>({
    data,
    columns,
    titleData,
    titleColumns,
    showPagination,
    handleChange,
    navigableFields,
    onPageChange,
    loading = false
}: Props<T>) => {

    const { t } = useTranslation();
    const dataSource = data;
    const dataTable = titleData;
    const curr = useCurrentPage();
    const setCurr = useSetCurrentPage();
    const rowsPerPage = usePageNumber();
    const totalCount = usePageSize();
    const { filterOn, setFilterOn } = useFilterOn();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const navigate = useNavigate();

    const formatNumber = (num: number, type: 'number' | 'double' = 'number'): string => {
        if (num === null || num === undefined || isNaN(num)) return "-";

        return new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: type === 'double' ? 2 : 0,
            maximumFractionDigits: type === 'double' ? 2 : 0,
            useGrouping: true,
        }).format(num);
    };

    const formatPeriodType = (periodString: string) => {
        if (!periodString) return "";

        const [startStr, endStr] = periodString.split("-").map(s => s.trim());

        const parseDate = (dateString: string) => {
            const datePart = dateString.split("GMT")[0].trim();
            const date = new Date(datePart);
            return date.toLocaleDateString("ru-RU");
        };

        return `${parseDate(startStr)} - ${parseDate(endStr)}`;
    };

    const getStatusTag = (status: string) => {
        if (status === t("tables.ACTIVE") || status === t("tables.SENT") || status === t("tables.In Progress") || status === t("analysis.PROGRESS") || status === t("finance.RECEIPT"))
            return <Tag color="green">{status}</Tag>;
        if (status === t("tables.OVERDUE") || status === t("tables.Done") || status === t("tables.FINISHED") || status === t("tables.PAUSE") || status === t("analysis.DONE") || status === t("finance.EXPENDITURE"))
            return <Tag color="red">{status}</Tag>;
        if (status === t("tables.SAVED") || status === t("tables.VERIFICATE") || status === t("tables.SAVE"))
            return <Tag color="orange">{status}</Tag>;
        else return <Tag color="default">{status}</Tag>;
    };

    // FIX: Include the render function in enhancedColumns
    const enhancedColumns: EnhancedTableColumn[] = titleColumns.map((col) => {
        const navigableField = navigableFields?.find((nf) => nf.key === col.key);
        return {
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            type: col.type,
            render: (value: any, record: T) => {
                if (col.key.toLowerCase().includes("status")) {
                    return getStatusTag(value);
                }

                if (col.type === "date") {

                    let date = null;

                    if (value === null || value === undefined) {
                        date = "-";
                    } else {
                        date = TableUtils.createDateTimeWithoutComma(value, userTimezone);
                    }

                    return date;
                }

                if (col.type === "period") {
                    return formatPeriodType(value);
                }

                if (col.type === "number" || col.type === "double") {
                    return value !== undefined && value !== null ? (
                        <div className={`${value < 0 ? "text-errorFill" : ""}`}>
                            {formatNumber(value, col.type)}
                        </div>
                    ) : "-";
                }

                if (col.type === "tags") {
                    return value.length > 0 ? (
                        <div className="flex flex-wrap max-w-64 gap-4">
                            {value.map((tag: { id: number; color: string; name: string; }) => (
                                <Tag key={tag.id} color={tag.color ? tag.color : "cyan"}>
                                    {tag.name}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        "—"
                    )
                }

                if (col.type === "currency") {
                    const number = formatNumber(value);
                    const formattedCurrency = TableUtils.createCurrencyFormat(number);

                    return (
                        <div className={`${value < 0 ? "text-errorFill" : ""}`}>
                            {formattedCurrency}
                        </div>
                    );
                }

                if (col.type === "percent") {
                    return TableUtils.createPercentFormat(value);
                }

                return navigableField ? (
                    <span
                        className="text-primary02 cursor-pointer hover:underline"
                        onClick={() => { navigate(navigableField.getPath(record), { state: { ownerId: record.deviceId, name: record.name, status: record.status, type: record.type } }); }}
                    >
                        {value}
                        <ArrowUpOutlined style={{ transform: "rotate(45deg)" }} />
                    </span>
                ) : col.render ? col.render(record, handleChange) : value;
            },
        };
    });

    // Also fix expandColumns to include render functions
    const expandColumns: EnhancedTableColumn[] = columns.map((col) => {
        return {
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            type: col.type,
            render: (value: any, record: T) => {
                if (col.key.toLowerCase().includes("status") || col.type === "status") {
                    return getStatusTag(value);
                }

                if (col.type === "date") {

                    let date = null;

                    if (value === null || value === undefined) {
                        date = "-";
                    } else {
                        date = TableUtils.createDateTimeWithoutComma(value, userTimezone);
                    }

                    return date;
                }

                if (col.type === "period") {
                    return formatPeriodType(value);
                }

                if (col.type === "number" || col.type === "double") {
                    return value !== undefined && value !== null ? (
                        <div className={`${value < 0 ? "text-errorFill" : ""}`}>
                            {formatNumber(value, col.type)}
                        </div>
                    ) : "-";
                }

                if (col.type === "tags") {
                    return value.length > 0 ? (
                        <div className="flex flex-wrap max-w-64 gap-4">
                            {value.map((tag: { id: number; color: string; name: string; }) => (
                                <Tag key={tag.id} color={tag.color ? tag.color : "cyan"}>
                                    {tag.name}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        "—"
                    )
                }

                if (col.type === "currency") {
                    const number = formatNumber(value);
                    const formattedCurrency = TableUtils.createCurrencyFormat(number);

                    const paperTypeType = record.paperTypeType;

                    if (paperTypeType === t("finance.RECEIPT")) {
                        return (
                            <div className="text-successFill">
                                +{formattedCurrency}
                            </div>
                        );
                    } else if (paperTypeType === t("finance.EXPENDITURE")) {
                        return (
                            <div className="text-errorFill">
                                -{formattedCurrency}
                            </div>
                        );
                    }
                    return formattedCurrency;
                }

                if (col.type === "percent") {
                    return TableUtils.createPercentFormat(value);
                }
                return col.render ? col.render(record, handleChange) : value;
            },
        };
    });

    const expandedRowRender = (record: any) => {
        const filteredData = dataSource && dataSource.filter((item) => item.deviceId === record.deviceId);

        return (
            <>
                <div style={{ marginLeft: '-42px' }}>
                    <Table
                        columns={[
                            {
                                title: '',
                                dataIndex: 'empty',
                                key: 'empty',
                                render: () => null,
                            },
                            ...expandColumns
                        ]}
                        dataSource={filteredData}
                        pagination={false}
                        components={{
                            header: {
                                cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableHeaderCellElement> & ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                                    <th
                                        {...props}
                                        style={{ backgroundColor: "#E4F0FF", fontWeight: "semi-bold", paddingLeft: "9px", paddingTop: "20px", paddingBottom: "20px", textAlign: "left", borderRadius: "0px" }}
                                        className="border-b border-[1px] border-background02 bg-background06 px-2.5 text-sm font-semibold text-text01 tracking-wider min-w-16"
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
                </div>
            </>
        );
    };

    // Ant Design pagination configuration
    const paginationConfig: TablePaginationConfig | false = showPagination ? {
        current: curr,
        pageSize: rowsPerPage,
        total: totalCount,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
            `${range[0]}-${range[1]} из ${total} записей`,
        pageSizeOptions: ['15', '50', '100', '120'],
        onChange: (page, pageSize) => {
            setFilterOn(!filterOn);
            setCurr(page);
            // Call external page change handler if provided
            if (onPageChange) {
                onPageChange(page, pageSize);
            }
        },
        onShowSizeChange: (_current, size) => {
            setCurr(1); // Reset to first page when changing page size
            setFilterOn(!filterOn);
            // Call external page change handler if provided
            if (onPageChange) {
                onPageChange(1, size);
            }
        },
        position: ['bottomRight'],
        size: 'default',
    } : false;

    return (
        <>
            <Table
                columns={enhancedColumns}
                expandable={{ expandedRowRender }}
                dataSource={dataTable.map((item, index) => ({
                    ...item,
                    key: `${item.title || index}` // Ensure unique keys
                }))}
                pagination={paginationConfig}
                loading={loading}
                components={{
                    header: {
                        cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableHeaderCellElement> & ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                            <th
                                {...props}
                                style={{ backgroundColor: "#E4F0FF", fontWeight: "semi-bold", paddingLeft: "9px", paddingTop: "20px", paddingBottom: "20px", textAlign: "left", borderRadius: "0px" }}
                                className="border-b border-[1px] border-background02 bg-background06 px-2.5 text-sm font-semibold text-text01 tracking-wider"
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
        </>
    )
};

export default ExpandableTable;