import { ArrowUpOutlined, CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { ClassAttributes, ThHTMLAttributes, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { useCurrentPage, usePageNumber, usePageSize, usePermissions, useSetCurrentPage, useSetDocumentType, useSetPageNumber } from "@/hooks/useAuthStore";
import { useTranslation } from "react-i18next";
import Modal from "../Modal/Modal.tsx";
import TableSettings from "./TableSettings.tsx";
import Edit from "@icons/edit.svg?react";
import { useFilterOn } from "@/components/context/useContext.tsx";
import Button from "@ui/Button/Button.tsx";
import SavedIcon from "@icons/SavedIcon.png";
import SentIcon from "@icons/SentIcon.png";
import routes from "@/routes/index.tsx";
import hasPermission from "@/permissions/hasPermission.tsx";
import TableUtils from "@/utils/TableUtils.tsx";
import Table from 'antd/es/table';
import Tooltip from 'antd/es/tooltip';
import Tag from 'antd/es/tag';
import AntDButton from 'antd/es/button';
import type { TablePaginationConfig, TableProps, ColumnType } from 'antd/es/table';

// Define tag interface
interface TagItem {
    id: number;
    color?: string;
    name: string;
}

// Define document type interface
interface DocumentType {
    name: string;
    value: string;
}

// Define permission interface
interface Permission {
    action: string;
    subject: string;
}

// Define route interface
interface Route {
    path: string;
    subMenu?: boolean;
    subNav?: Route[];
}

interface TableColumn {
    label: string;
    key: string;
    type?: "date" | "string" | "number" | "currency" | "percent" | "period" | "tags" | "double" | "status" | string;
    render?: any;
    sortable?: boolean;
    filters?: { text: string; value: string; }[];
}

interface EnhancedTableColumn<T extends TableRow = TableRow> extends ColumnType<T> {
    title: string;
    dataIndex: string;
    key: string;
    type?: "date" | "string" | "number" | "currency" | "percent" | "period" | "tags" | "double" | "status" | string;
    render?: (value: unknown, record: T) => React.ReactNode;
}

type Props<T extends TableRow> = {
    data: T[];
    columns: TableColumn[];
    tableTitle?: string;
    rowKey?: keyof T;
    onEdit?: (id: number) => void;
    navigableFields?: { key: string; getPath: (record: T) => string }[];
    headerBgColor?: string;
    isCheck?: boolean;
    isDisplayEdit?: boolean;
    showPagination?: boolean;
    title?: string;
    nameUrlTitle?: string;
    urlTitleId?: number;
    handleChange?: (id: number, key: string, value: string | number) => void;
    showTotal?: boolean;
    renderCell?: any;
    isStatus?: boolean;
    showTotalClean?: boolean;
    // New props for pagination control
    onPageChange?: (page: number, pageSize: number) => void;
    loading?: boolean;
} & Omit<TableProps<T>, 'columns' | 'dataSource' | 'pagination' | 'expandable'>;

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
    headerBgColor = "#E4F0FF",
    isCheck = false,
    isDisplayEdit = false,
    showPagination = false,
    urlTitleId,
    title,
    nameUrlTitle,
    handleChange,
    showTotal,
    renderCell,
    isStatus,
    showTotalClean,
    onPageChange,
    loading = false
}: Props<T>) => {
    const navigate = useNavigate();
    const curr = useCurrentPage();
    const setCurr = useSetCurrentPage();
    const rowsPerPage = usePageNumber();
    const totalCount = usePageSize();
    const setPageSize = useSetPageNumber();
    const { t } = useTranslation();
    const location = useLocation();
    const { filterOn, setFilterOn } = useFilterOn();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const routePath = location.pathname;
    const autoTableId = `${routePath}-default-table`;
    const storageKey = `columns-${autoTableId}`;

    const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : columns.map((col) => col.key);
    });
    const setDocumentType = useSetDocumentType();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const displayedColumns = columns.filter((column) => selectedColumns.includes(column.key));

    const handleColumnToggle = (key: string) => {
        setSelectedColumns((prev) =>
            prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
        );
    };

    // Sorting functionality
    const getSorterProps = (columnKey: string, columnType?: string): Partial<ColumnType<TableRow>> => {
        if (columnType === 'number' || columnType === 'double' || columnType === 'currency') {
            return {
                sorter: (a, b) => {
                    const aVal = a[columnKey as keyof TableRow] as number;
                    const bVal = b[columnKey as keyof TableRow] as number;
                    return aVal - bVal;
                },
                sortDirections: ['descend', 'ascend'],
            };
        }
        return {};
    };

    const getStatusTag = (status: string) => {
        if (status === t("tables.ACTIVE") || status === t("tables.SENT") || status === t("tables.In Progress") || status === t("analysis.PROGRESS") || status === t("finance.RECEIPT"))
            return <Tag color="green">{status}</Tag>;
        if (status === t("tables.OVERDUE") || status === t("tables.Done") || status === t("tables.FINISHED") || status === t("tables.PAUSE") || status === t("analysis.DONE") || status === t("finance.EXPENDITURE"))
            return <Tag color="red">{status}</Tag>;
        if (status === t("tables.SAVED") || status === t("tables.VERIFICATE"))
            return <Tag color="orange">{status}</Tag>;
        else return <Tag color="default">{status}</Tag>;
    };

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

    const getActivePage = (): Route | undefined => {
        for (const item of routes as Route[]) {
            if (location.pathname === item.path) {
                return item;
            } else if (item.subMenu && item.subNav) {
                for (const subItem of item.subNav) {
                    if (location.pathname === subItem.path) {
                        return subItem;
                    } if (subItem.subMenu && subItem.subNav) {
                        for (const subSubItem of subItem.subNav) {
                            if (location.pathname === subSubItem.path) {
                                return subSubItem;
                            }
                        }
                    }
                }
            }
        }
        return undefined;
    };

    const userPermissions = usePermissions() as Permission[];
    const activePage = getActivePage();

    const getRequiredPermissions = (path: string): Permission[] => {
        if (path.includes("administration"))
            return [
                { action: "manage", subject: "Organization" },
                { action: "update", subject: "Organization" },
            ];
        if (path.includes("station"))
            return [
                { action: "manage", subject: "Pos" },
                { action: "update", subject: "Pos" },
            ];
        if (path.includes("equipment"))
            return [
                { action: "manage", subject: "Incident" },
                { action: "update", subject: "Incident" },
                { action: "manage", subject: "TechTask" },
                { action: "update", subject: "TechTask" },
            ];
        if (path.includes("warehouse"))
            return [
                { action: "manage", subject: "Warehouse" },
                { action: "update", subject: "Warehouse" },
            ];
        if (path.includes("finance"))
            return [
                { action: "manage", subject: "CashCollection" },
                { action: "update", subject: "CashCollection" },
            ];
        if (path.includes("analysis"))
            return [
                { action: "manage", subject: "ShiftReport" },
                { action: "update", subject: "ShiftReport" },
            ];
        if (path.includes("hr"))
            return [
                { action: "manage", subject: "Hr" },
                { action: "update", subject: "Hr" },
            ];
        else
            return [];
    };

    const enhancedColumns: EnhancedTableColumn<T>[] = displayedColumns.map((col) => {
        const navigableField = navigableFields.find((nf) => nf.key === col.key);

        // Base column configuration
        const baseColumn: EnhancedTableColumn<T> = {
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            type: col.type,
            render: (value: unknown, record: T) => {
                if (col.key.toLowerCase().includes("status") || col.type === "status") {
                    return getStatusTag(String(value));
                }

                if (renderCell) {
                    return renderCell(col, record);
                }

                if (col.type === "date") {
                    let date = null;

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
                    return TableUtils.createCurrencyFormat(number);
                }

                if (col.type === "percent") {
                    return TableUtils.createPercentFormat(Number(value));
                }

                return navigableField ? (
                    <span
                        className="text-primary02 cursor-pointer hover:underline"
                        onClick={() => {
                            navigate(navigableField.getPath(record), {
                                state: {
                                    ownerId: record.id,
                                    name: record.name,
                                    status: record.status,
                                    type: record.type,
                                    workDate: record.startWorkDate,
                                    endDate: record.endSpecifiedDate
                                }
                            });
                            setDocumentType(documentTypes.find((doc) => doc.name === record.type)?.value || "");
                        }}
                    >
                        {String(value)}
                        <ArrowUpOutlined style={{ transform: "rotate(45deg)" }} />
                    </span>
                ) : col.render ? col.render(record, handleChange) : String(value);
            },
        };

        if (col.filters && col.filters.length > 0) {
            Object.assign(baseColumn, {
                filters: col.filters,
                onFilter: (value: string | number | boolean, record: T) => {
                    const key = col.key as keyof T;
                    const recordValue = record[key];

                    if (Array.isArray(recordValue)) {
                        return recordValue.some((v: TagItem) =>
                            v.name?.toLowerCase().includes(String(value).toLowerCase())
                        );
                    }
                    return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
                },

                filterMultiple: true,
            });
        }

        if (col.sortable !== false && (col.type === 'number' || col.type === 'double' || col.type === 'currency')) {
            Object.assign(baseColumn, getSorterProps(col.key, col.type));
        }

        return baseColumn;
    });

    const allowed = hasPermission(userPermissions, getRequiredPermissions(activePage?.path || ""));

    if (onEdit && allowed) {
        enhancedColumns.push({
            title: "",
            dataIndex: "actions",
            key: "actions",
            render: (_: unknown, record: T) => (
                <Tooltip title="Редактировать">
                    <AntDButton
                        type="text"
                        icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
                        onClick={() => onEdit(record.id)}
                        style={{ height: "24px" }}
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
            render: (_: unknown, record: T) =>
                record.status === t("tables.FINISHED") ? (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : null,
        });
    }

    if (isStatus) {
        enhancedColumns.unshift({
            title: "",
            dataIndex: "statusCheck",
            key: "statusCheck",
            render: (_: unknown, record: T) =>
                record.status === "SENT" ?
                    <img src={SentIcon} loading="lazy" alt="SENT" />
                    : <img src={SavedIcon} loading="lazy" alt="SAVED" />
        });
    }

    const createTotalRow = (sliceStart: number) => {
        const totalEntries = Object.fromEntries(
            displayedColumns.slice(sliceStart).map((column) => [
                column.key,
                column.type === "number"
                    ? formatNumber(
                        data.reduce(
                            (sum, row) => sum + (Number(row[column.key as keyof T]) || 0),
                            0
                        )
                    )
                    : "-",
            ])
        );

        return {
            key: "total",
            [displayedColumns[0].key]: t("finance.total"),
            ...totalEntries,
        } as unknown as T;
    };

    const totalRow = showTotal ? createTotalRow(3) : null;
    const totalClean = showTotalClean ? createTotalRow(2) : null;

    const dataSource: T[] = showTotal && totalRow ? [...data, totalRow as T] : totalClean ? [...data, totalClean as T] : data;

    const documentTypes: DocumentType[] = [
        { name: t("routes.COMMISSIONING"), value: "COMMISSIONING" },
        { name: t("routes.WRITEOFF"), value: "WRITEOFF" },
        { name: t("routes.MOVING"), value: "MOVING" },
        { name: t("routes.INVENTORY"), value: "INVENTORY" },
        { name: t("routes.RECEIPT"), value: "RECEIPT" },
    ];

    // Ant Design pagination configuration
    const paginationConfig: TablePaginationConfig | false = showPagination ? {
        current: curr,
        pageSize: rowsPerPage,
        total: totalCount,
        showSizeChanger: false,
        showQuickJumper: false,
        onChange: (page, pageSize) => {
            setFilterOn(!filterOn);
            setPageSize(pageSize);
            setCurr(page);
            if (onPageChange) {
                onPageChange(page, pageSize);
            }
        },
        onShowSizeChange: (_current, size) => {
            setCurr(1);
            setFilterOn(!filterOn);
            if (onPageChange) {
                onPageChange(1, size);
            }
        },
        position: ['bottomLeft'],
        size: 'default',
    } : false;

    return (
        <div>
            {tableTitle && <h2 className="text-lg font-semibold mb-4">{tableTitle}</h2>}
            {title && (
                <span
                    className="cursor-pointer flex justify-start"
                    onClick={() => navigate(`${nameUrlTitle}`, { state: { ownerId: urlTitleId } })}
                >
                    <Button
                        title={title}
                        type="outline"
                        classname="mb-2"
                        iconArrowDiognal={true}
                    />
                </span>
            )}
            <Table
                columns={enhancedColumns}
                dataSource={dataSource}
                rowKey={rowKey as string}
                pagination={paginationConfig}
                loading={loading}
                tableLayout="fixed"
                components={{
                    header: {
                        cell: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLTableHeaderCellElement> & ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
                            <th
                                {...props}
                                style={{ backgroundColor: headerBgColor, fontWeight: "semi-bold", paddingLeft: "9px", paddingTop: "20px", paddingBottom: "20px", textAlign: "left", borderRadius: "0px" }}
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
            {isDisplayEdit && <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-primary02 text-sm font-semibold flex items-center gap-2 mt-5 py-2"
                >
                    Настройки таблицы <Edit />
                </button>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleClick={() => setIsModalOpen(false)} classname="max-h-[600px] overflow-auto">
                    <TableSettings
                        columns={columns}
                        selectedColumns={selectedColumns}
                        onColumnToggle={handleColumnToggle}
                        onIsModalOpen={() => setIsModalOpen(false)}
                        storageKey={storageKey}
                    />
                </Modal>
            </>}
        </div>
    );
};

export default DynamicTable;