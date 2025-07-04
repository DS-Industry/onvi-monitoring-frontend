import { ArrowUpOutlined, CheckCircleOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { ClassAttributes, ThHTMLAttributes, useState, useRef } from "react";
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
import Input from 'antd/es/input';
import Space from 'antd/es/space';
import type { TablePaginationConfig, TableProps, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import type { InputRef } from 'antd/es/input';

interface TableColumn {
    label: string;
    key: string;
    type?: "date" | "string" | "number" | "currency" | "percent" | "period" | "tags" | "double" | "status" | string;
    render?: any;
    filterable?: boolean; // New prop to enable filtering
    sortable?: boolean;   // New prop to enable sorting
}

interface EnhancedTableColumn extends ColumnType<any> {
    title: string;
    dataIndex: string;
    key: string;
    type?: "date" | "string" | "number" | "currency" | "percent" | "period" | "tags" | "double" | "status" | string;
    render?: any;
}

type Props<T> = {
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
    renderCell?: (column: TableColumn, row: any) => React.ReactNode;
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

    // Search functionality refs and states
    const searchInput = useRef<InputRef>(null);

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

    // Search functionality
    const handleSearch = (_selectedKeys: string[], confirm: (param?: any) => void) => {
        confirm();
    };

    const handleReset = (clearFilters: (() => void) | undefined) => {
        if (clearFilters) {
            clearFilters();
        }
    };

    const getColumnSearchProps = (dataIndex: string, columnType?: string): Partial<ColumnType<any>> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <AntDButton
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </AntDButton>
                    <AntDButton
                        onClick={() => {
                            if (clearFilters) {
                                clearFilters();
                            }
                            setSelectedKeys([]);
                            handleReset(clearFilters);
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </AntDButton>
                    <AntDButton
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                        }}
                    >
                        Filter
                    </AntDButton>
                    <AntDButton
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Close
                    </AntDButton>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            const recordValue = record[dataIndex];
            if (recordValue === null || recordValue === undefined) return false;
            
            // Handle different column types for filtering
            if (columnType === 'number' || columnType === 'double' || columnType === 'currency') {
                return recordValue.toString().includes(value as string);
            }
            
            return recordValue.toString().toLowerCase().includes((value as string).toLowerCase());
        },
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });

    // Sorting functionality
    const getSorterProps = (columnKey: string, columnType?: string): Partial<ColumnType<any>> => {
        if (columnType === 'number' || columnType === 'double' || columnType === 'currency') {
            return {
                sorter: (a, b) => {
                    const aVal = parseFloat(a[columnKey]) || 0;
                    const bVal = parseFloat(b[columnKey]) || 0;
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

    const getActivePage = () => {
        for (const item of routes) {
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
    };

    const userPermissions = usePermissions();
    const activePage = getActivePage();

    const getRequiredPermissions = (path: string) => {
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

    const enhancedColumns: EnhancedTableColumn[] = displayedColumns.map((col) => {
        const navigableField = navigableFields.find((nf) => nf.key === col.key);
        
        // Base column configuration
        const baseColumn: EnhancedTableColumn = {
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            type: col.type,
            render: (value: any, record: T) => {
                if (col.key.toLowerCase().includes("status") || col.type === "status") {
                    return getStatusTag(value);
                }

                if (renderCell) {
                    return renderCell(col, record);
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
                    return TableUtils.createCurrencyFormat(number);
                }

                if (col.type === "percent") {
                    return TableUtils.createPercentFormat(value);
                }

                return navigableField ? (
                    <span
                        className="text-primary02 cursor-pointer hover:underline"
                        onClick={() => { navigate(navigableField.getPath(record), { state: { ownerId: record.id, name: record.name, status: record.status, type: record.type, workDate: record.startWorkDate, endDate: record.endSpecifiedDate } }); setDocumentType(documentTypes.find((doc) => doc.name === record.type)?.value || ""); }}
                    >
                        {value}
                        <ArrowUpOutlined style={{ transform: "rotate(45deg)" }} />
                    </span>
                ) : col.render ? col.render(record, handleChange) : value;
            },
        };

        // Add filtering if enabled
        if (col.filterable !== false) { // Default to true unless explicitly disabled
            Object.assign(baseColumn, getColumnSearchProps(col.key, col.type));
        }

        // Add sorting if enabled for number/currency columns
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
            render: (_: any, record: T) => (
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
            render: (_: any, record: T) =>
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
            render: (_: any, record: T) =>
                record.status === "SENT" ?
                    <img src={SentIcon} loading="lazy" alt="SENT" />
                    : <img src={SavedIcon} loading="lazy" alt="SAVED" />
        });
    }

    const totalRow = showTotal
        ? {
            key: "total",
            [displayedColumns[0].key]: t("finance.total"),
            ...Object.fromEntries(
                displayedColumns.slice(3).map((column) => [
                    column.key,
                    column.type === "number"
                        ? formatNumber(
                            data.reduce(
                                (sum, row) => sum + (Number(row[column.key]) || 0),
                                0
                            )
                        )
                        : "-",
                ])
            ),
        }
        : null;

    const totalClean = showTotalClean
        ? {
            key: "total",
            [displayedColumns[0].key]: t("finance.total"),
            ...Object.fromEntries(
                displayedColumns.slice(2).map((column) => [
                    column.key,
                    column.type === "number"
                        ? formatNumber(
                            data.reduce(
                                (sum, row) => sum + (Number(row[column.key]) || 0),
                                0
                            )
                        )
                        : "-",
                ])
            ),
        }
        : null;

    const dataSource = showTotal && totalRow ? [...data, totalRow] : totalClean ? [...data, totalClean] : data;

    const documentTypes = [
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
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['15', '50', '100', '120'],
        onChange: (page, pageSize) => {
            setFilterOn(!filterOn);
            setPageSize(pageSize);
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