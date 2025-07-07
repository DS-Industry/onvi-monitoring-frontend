import { useFilterOn } from '@/components/context/useContext';
import { useCurrentPage, useSetCurrentPage, usePageNumber, usePageSize } from '@/hooks/useAuthStore';
import TableUtils from "@/utils/TableUtils.tsx";
import { ClassAttributes, ThHTMLAttributes } from 'react';
import { ArrowUpOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from "antd/es/table";
import Tag from "antd/es/tag";
import type { TablePaginationConfig, ColumnType } from 'antd/es/table';

interface TagItem {
    id: number;
    color?: string;
    name: string;
}
interface TableColumn {
    label: string;
    key: string;
    type?: "date" | "string" | "number" | string;
    render?: (record: TableRow, handleChange?: (id: number, key: string, value: string | number) => void) => React.ReactNode;
    sortable?: boolean;
    filters?: { text: string; value: string; }[];
}

interface EnhancedTableColumn<T extends TableRow = TableRow> extends ColumnType<T> {
    title: string;
    dataIndex: string;
    key: string;
    type?: "date" | "string" | "number" | string;
    render?: (value: unknown, record: T) => React.ReactNode;
    sortable?: boolean;
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
    [key: string]: unknown; // Allow indexing with string keys
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

    const getSorterProps = (columnKey: string, columnType?: string): Partial<ColumnType<TableRow>> => {
        if (columnType === 'number' || columnType === 'double' || columnType === 'currency') {
            return {
                sorter: (a, b) => {
                    const aVal = parseFloat(String(a[columnKey])) || 0;
                    const bVal = parseFloat(String(b[columnKey])) || 0;
                    return aVal - bVal;
                },
                sortDirections: ['descend', 'ascend'],
            };
        }
        return {};
    };

    // FIX: Include the render function in enhancedColumns
    const enhancedColumns: EnhancedTableColumn<T>[] = titleColumns.map((col) => {
        const navigableField = navigableFields?.find((nf) => nf.key === col.key);
        const baseColumn: EnhancedTableColumn<T> = {
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            type: col.type,
            render: (value: unknown, record: T): React.ReactNode => {
                if (col.key.toLowerCase().includes("status")) {
                    return getStatusTag(String(value));
                }

                if (col.type === "date") {

                    let date: React.ReactNode = null;

                    if (value === null || value === undefined) {
                        date = "-";
                    } else {
                        date = TableUtils.createDateTimeWithoutComma(value as string | Date, userTimezone);
                    }

                    return date;
                }

                if (col.type === "period") {
                    return formatPeriodType(String(value));
                }

                if (col.type === "number" || col.type === "double") {
                    const numValue = Number(value);
                    return value !== undefined && value !== null && !isNaN(numValue) ? (
                        <div className={`${numValue < 0 ? "text-errorFill" : ""}`}>
                            {formatNumber(numValue, col.type)}
                        </div>
                    ) : "-";
                }

                if (col.type === "tags") {
                    const tags = value as TagItem[];
                    return tags && tags.length > 0 ? (
                        <div className="flex flex-wrap max-w-64 gap-4">
                            {tags.map((tag: TagItem) => (
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
                    const number = formatNumber(Number(value));
                    const formattedCurrency = TableUtils.createCurrencyFormat(number);

                    return (
                        <div className={`${Number(value) < 0 ? "text-errorFill" : ""}`}>
                            {formattedCurrency}
                        </div>
                    );
                }

                if (col.type === "percent") {
                    return TableUtils.createPercentFormat(Number(value));
                }

                return navigableField ? (
                    <span
                        className="text-primary02 cursor-pointer hover:underline"
                        onClick={() => { navigate(navigableField.getPath(record), { state: { ownerId: record.deviceId, name: record.name, status: record.status, type: record.type } }); }}
                    >
                        {String(value)}
                        <ArrowUpOutlined style={{ transform: "rotate(45deg)" }} />
                    </span>
                ) : col.render ? col.render(record, handleChange) as React.ReactNode : value as React.ReactNode;
            },
        };

        if (col.filters && col.filters.length > 0) {
            Object.assign(baseColumn, {
                filters: col.filters,
                onFilter: (value: string, record: T) => {
                    const recordValue = record[col.key];
                    if (Array.isArray(recordValue)) {
                        return recordValue.some((v: TagItem) =>
                            v.name?.toLowerCase().includes(value.toLowerCase())
                        );
                    }
                    return String(recordValue).toLowerCase().includes(value.toLowerCase());
                },
                filterMultiple: true,
            });
        }

        return baseColumn;
    });

    // Also fix expandColumns to include render functions
    const expandColumns: EnhancedTableColumn<T>[] = columns.map((col) => {
        const baseColumns: EnhancedTableColumn<T> = {
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            type: col.type,
            render: (value: unknown, record: T): React.ReactNode => {
                if (col.key.toLowerCase().includes("status") || col.type === "status") {
                    return getStatusTag(String(value));
                }

                if (col.type === "date") {

                    let date: React.ReactNode = null;

                    if (value === null || value === undefined) {
                        date = "-";
                    } else {
                        date = TableUtils.createDateTimeWithoutComma(value as string | Date, userTimezone);
                    }

                    return date;
                }

                if (col.type === "period") {
                    return formatPeriodType(String(value));
                }

                if (col.type === "number" || col.type === "double") {
                    const numValue = Number(value);
                    return value !== undefined && value !== null && !isNaN(numValue) ? (
                        <div className={`${numValue < 0 ? "text-errorFill" : ""}`}>
                            {formatNumber(numValue, col.type)}
                        </div>
                    ) : "-";
                }

                if (col.type === "tags") {
                    const tags = value as TagItem[];
                    return tags && tags.length > 0 ? (
                        <div className="flex flex-wrap max-w-64 gap-4">
                            {tags.map((tag: TagItem) => (
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
                    const number = formatNumber(Number(value));
                    const formattedCurrency = TableUtils.createCurrencyFormat(number);

                    const paperTypeType = (record as TableRow).paperTypeType;

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
                    return TableUtils.createPercentFormat(Number(value));
                }

                return col.render ? col.render(record, handleChange) : (value as React.ReactNode);
            },
        };

        if (col.sortable !== false && (col.type === 'number' || col.type === 'double' || col.type === 'currency')) {
            Object.assign(baseColumns, getSorterProps(col.key, col.type));
        }

        return baseColumns;
    });

    const expandedRowRender = (record: TableRow) => {
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
        position: ['bottomLeft'],
        size: 'default',
    } : false;

    return (
        <>
            <Table
                columns={enhancedColumns}
                expandable={{ expandedRowRender }}
                dataSource={dataTable as unknown as T[]}
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