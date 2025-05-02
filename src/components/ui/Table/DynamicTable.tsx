import { Table, Tooltip, Tag, Button as AntDButton } from "antd";
import { ArrowUpOutlined, CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { ClassAttributes, ThHTMLAttributes, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { useCurrentPage, usePageNumber, usePageSize, usePermissions, useSetCurrentPage, useSetDocumentType } from "@/hooks/useAuthStore";
import { useTranslation } from "react-i18next";
import Modal from "../Modal/Modal.tsx";
import TableSettings from "./TableSettings.tsx";
import Edit from "@icons/edit.svg?react";
import { useFilterOn } from "@/components/context/useContext.tsx";
import Icon from "feather-icons-react";
import Button from "@ui/Button/Button.tsx";
import SavedIcon from "@icons/SavedIcon.png";
import SentIcon from "@icons/SentIcon.png";
import routes from "@/routes/index.tsx";
import hasPermission from "@/permissions/hasPermission.tsx";
import TableUtils from "@/utils/TableUtils.tsx";

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
    showTotalClean
}: Props<T>) => {
    const navigate = useNavigate();
    const curr = useCurrentPage();
    const setCurr = useSetCurrentPage();
    const rowsPerPage = usePageNumber();
    const totalCount = usePageSize();
    const { t } = useTranslation();
    const location = useLocation();
    const { filterOn, setFilterOn } = useFilterOn();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const routePath = location.pathname;
    const autoTableId = `${routePath}-default-table`; // fallback ID
    const storageKey = `columns-${autoTableId}`;

    const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : columns.map((col) => col.key);
    });
    const setDocumentType = useSetDocumentType();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const displayedColumns = columns.filter((column) => selectedColumns.includes(column.key));
    const totalPages = Math.ceil(totalCount / rowsPerPage);

    const handleColumnToggle = (key: string) => {
        setSelectedColumns((prev) =>
            prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
        );
    };

    const getStatusTag = (status: string) => {
        if (status === t("tables.ACTIVE") || status === t("tables.SENT") || status === t("tables.In Progress"))
            return <Tag color="green">{status}</Tag>;
        if (status === t("tables.OVERDUE") || status === t("tables.Done") || status === t("tables.FINISHED") || status === t("tables.PAUSE"))
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
        if (!periodString) return ""; // Handle empty values

        const [startStr, endStr] = periodString.split("-").map(s => s.trim());

        const parseDate = (dateString: string) => {
            // Extract only the first part (before GMT) to ensure compatibility
            const datePart = dateString.split("GMT")[0].trim();
            const date = new Date(datePart);
            return date.toLocaleDateString("ru-RU"); // Formats to DD.MM.YYYY
        };

        return `${parseDate(startStr)} - ${parseDate(endStr)}`;
    };

    const generatePaginationRange = () => {
        const range: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        } else {
            range.push(1);

            if (curr > 3) range.push("...");

            const start = Math.max(2, curr - 1);
            const end = Math.min(totalPages - 1, curr + 1);
            for (let i = start; i <= end; i++) range.push(i);

            if (curr < totalPages - 2) range.push("...");

            range.push(totalPages);
        }

        return range;
    };

    const handlePageClick = (page: number | string) => {
        if (typeof page === "number") {
            setFilterOn(!filterOn);
            setCurr(page);
        }
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
        // Add cases for other components as needed
        else
            return [];
    };

    const enhancedColumns: EnhancedTableColumn[] = displayedColumns.map((col) => {
        const navigableField = navigableFields.find((nf) => nf.key === col.key);

        return {
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            type: col.type,
            render: (value: any, record: T) => {
                // If column is 'status', show tags
                if (col.key === "status") {
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
                ) : col.render ? col.render(record, handleChange) :
                    value;
            },
        };
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
                ) : null, // Show nothing if status is not "FINISHED"
        });
    }


    if (isStatus) {
        enhancedColumns.unshift({
            title: "",
            dataIndex: "statusCheck",
            key: "statusCheck",
            render: (_: any, record: T) =>
                record.status === "SENT" ?
                    <img src={SentIcon} loading="lazy" />
                    : <img src={SavedIcon} loading="lazy" />
        });
    }
    const totalRow = showTotal
        ? {
            key: "total", // Ensure unique key for the row
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
            key: "total", // Ensure unique key for the row
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

    // Append the total row to the data source
    const dataSource = showTotal && totalRow ? [...data, totalRow] : totalClean ? [...data, totalClean] : data;

    const documentTypes = [
        { name: t("routes.COMMISSIONING"), value: "COMMISSIONING" },
        { name: t("routes.WRITEOFF"), value: "WRITEOFF" },
        { name: t("routes.MOVING"), value: "MOVING" },
        { name: t("routes.INVENTORY"), value: "INVENTORY" },
        { name: t("routes.RECEIPT"), value: "RECEIPT" },
    ];

    return (
        <div>
            {tableTitle && <h2 className="text-lg font-semibold mb-4">{tableTitle}</h2>}
            {title && (
                <span
                    className="cursor-pointer  flex justify-start sm:justify-end"
                    onClick={() => navigate(`${nameUrlTitle}`, { state: { ownerId: urlTitleId } })}
                >
                    {/* <div className=" text-xl md:text-2xl flex space-x-2 items-center text-primary02 hover:text-primary02_Hover hover:underline">
                {title}
                <Icon icon="arrow-up-right" className="w-6 h-6"/>
              </div> */}
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
                pagination={false}
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
            {showPagination && <div className="mt-4 flex gap-2">
                <button
                    onClick={() => {
                        const newPage = Math.max(1, curr - 1);
                        setFilterOn(!filterOn);
                        setCurr(newPage);
                    }}
                    disabled={curr === 1}
                    className={`px-2 py-1 ${curr === 1 ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
                >
                    <Icon icon="chevron-left" />
                </button>
                {generatePaginationRange().map((page, index) =>
                    page === "..." ? (
                        <span key={index} className="px-2 py-1 text-gray-400">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => handlePageClick(page)}
                            className={`px-4 py-2 font-semibold ${curr === page ? "bg-white text-primary02 rounded-lg border border-primary02" : "text-text01"}`}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    onClick={() => {
                        setFilterOn(!filterOn);
                        setCurr(Math.min(totalPages, curr + 1));
                    }}
                    disabled={curr === totalPages}
                    className={`px-2 py-1 ${curr === totalPages ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
                >
                    <Icon icon="chevron-right" />
                </button>
            </div>}
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
