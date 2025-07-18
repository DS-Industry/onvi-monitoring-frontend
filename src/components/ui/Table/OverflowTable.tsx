import React, { useState } from "react";
import Edit from "@icons/edit.svg?react";
import UpdateIcon from "@icons/PencilIcon.png";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "@ui/Modal/Modal.tsx";
import TableSettings from "./TableSettings.tsx";
import SavedIcon from "@icons/SavedIcon.png";
import SentIcon from "@icons/SentIcon.png";
import CheckIcon from "@icons/checkSuccess.png";
import { useCurrentPage, usePageNumber, usePageSize, usePermissions, useSetCurrentPage, useSetDocumentType } from "@/hooks/useAuthStore.ts";
import { Can } from "@/permissions/Can.tsx";
import routes from "@/routes/index.tsx";
import { useFilterOn } from "@/components/context/useContext.tsx";
import { useTranslation } from "react-i18next";
import Button from "@ui/Button/Button.tsx";
import TableUtils from "@/utils/TableUtils.tsx";
import {
    ArrowRightOutlined,
    ExportOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";

type TableRow = {
  id: number;
  [key: string]: string | number | boolean | Date;

};
interface TableColumn {
  label: string;
  key: string;
  type?: "date" | "string" | "number" | string;
  render?: any;
}

type Props<T extends TableRow> = {
  tableData: T[];
  columns: TableColumn[];
  isUpdate?: boolean;
  isUpdateLeft?: boolean;
  isStatus?: boolean;
  isDisplayEdit?: boolean;
  nameUrl?: string;
  title?: string;
  nameUrlTitle?: string;
  urlTitleId?: number;
  onUpdate?: (id: number) => void;
  handleChange?: (id: number, key: string, value: string | number) => void;
  isCheck?: boolean;
  showTotal?: boolean;
  renderCell?: (column: TableColumn, row: TableRow) => React.ReactNode;
  showPagination?: boolean;
  showTotalClean?: boolean;
};

const OverflowTable = <T extends TableRow>({
  tableData,
  columns,
  isUpdate,
  isUpdateLeft,
  isStatus,
  isDisplayEdit,
  nameUrl,
  title,
  nameUrlTitle,
  urlTitleId,
  onUpdate,
  handleChange,
  isCheck,
  showTotal = false,
  renderCell,
  showPagination,
  showTotalClean = false
}: Props<T>) => {

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map((col) => col.key)
  );

  const curr = useCurrentPage();
  const setCurr = useSetCurrentPage();
  const rowsPerPage = usePageNumber();
  const totalCount = usePageSize();
  const { t } = useTranslation();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const displayedColumns = columns.filter((column) => selectedColumns.includes(column.key));
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const currentData = tableData;

  const { filterOn, setFilterOn } = useFilterOn();

  const navigate = useNavigate();
  const setDocumentType = useSetDocumentType();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const formatNumber = (num: number, type: 'number' | 'double' = 'number'): string => {
    if (num === null || num === undefined || isNaN(num)) return "-";

    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: type === 'double' ? 2 : 0,
      maximumFractionDigits: type === 'double' ? 2 : 0,
      useGrouping: true,
    }).format(num);
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
    // Add cases for other components as needed
    else
      return [];
  };

  const documentTypes = [
    { name: t("routes.COMMISSIONING"), value: "COMMISSIONING" },
    { name: t("routes.WRITEOFF"), value: "WRITEOFF" },
    { name: t("routes.MOVING"), value: "MOVING" },
    { name: t("routes.INVENTORY"), value: "INVENTORY" },
    { name: t("routes.RECEIPT"), value: "RECEIPT" },
  ];

  return (
    <>
      <div className="w-full overflow-auto">
        <div className="max-w-full overflow-x-auto">
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
          <table className="w-full">
            <thead>
              <tr>
                {isCheck && <th className="border border-background02 bg-background06 w-11"></th>}
                {isStatus && <th className="border border-background02 bg-background06 w-11"></th>}
                <Can
                  requiredPermissions={getRequiredPermissions(activePage?.path || "")}
                  userPermissions={userPermissions}
                >
                  {(allowed) => allowed && isUpdateLeft && <th className="border border-background02 bg-background06 w-11 min-w-11"></th>}
                </Can>
                {columns.map(
                  (column) =>
                    selectedColumns.includes(column.key) && (
                      <th
                        key={column.key}
                        className="border-b border-x-2 border-background02 bg-background06 px-2.5 py-5 text-start text-sm font-semibold text-text01 tracking-wider"
                      >
                        {column.label}
                      </th>
                    )
                )}
                <Can
                  requiredPermissions={getRequiredPermissions(activePage?.path || "")}
                  userPermissions={userPermissions}
                >
                  {(allowed) => allowed && isUpdate && <th className="border border-background02 bg-background06 w-11 min-w-11"></th>}
                </Can>
              </tr>
            </thead>
            <tbody>
              {currentData?.map((row: TableRow) => (
                <tr key={row.id}>
                  {isCheck && (
                    <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                      {row.status === "FINISHED" && <img src={CheckIcon} loading="lazy" alt="CHECK" />}
                    </td>
                  )}
                  {isStatus && (
                    <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                      {row.status === "SENT" ? <img src={SentIcon} loading="lazy" alt="SENT" /> : <img src={SavedIcon} loading="lazy" alt="SAVED" />}
                    </td>
                  )}
                  <Can
                    requiredPermissions={getRequiredPermissions(activePage?.path || "")}
                    userPermissions={userPermissions}
                  >
                    {(allowed) => allowed && isUpdateLeft && (
                      <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                        <button className="flex items-center" onClick={() => onUpdate && onUpdate(row.id)}>
                          <img src={UpdateIcon} loading="lazy" alt="UPDATE" />
                        </button>
                      </td>
                    )}
                  </Can>
                  {displayedColumns.map((column) => (
                    <td key={column.key} className="border-b border-x-4 border-b-[#E4E5E7] border-x-background02 bg-background02 py-2 px-2.5 text-start whitespace-nowrap text-sm text-text01 overflow-hidden overflow-x-visible">
                      {(column.key === 'name' || (column.key === 'posName' && !row.name)) && nameUrl ? (
                        <span
                          className="cursor-pointer"
                          onClick={() => { navigate(`${nameUrl}`, { state: { ownerId: row.id, name: row.name, status: row.status, type: row.type, workDate: row.startWorkDate, endDate: row.endSpecifiedDate } }); setDocumentType(documentTypes.find((doc) => doc.name === row.type)?.value || "") }}
                        >
                          <div className="whitespace-nowrap flex items-center space-x-2 text-ellipsis overflow-hidden text-primary02 hover:text-primary02_Hover hover:underline">
                            {String(row[column.key])}
                            <ExportOutlined className="w-4 h-4" />
                          </div>
                        </span>
                      ) : (column.type === 'number' || column.type === 'double') ? (
                        row[column.key] ? <div className={`${(Number(row[column.key]) < 0 || (column.key === "shortageDeviceType" && Number(row[column.key]) > 0)) ? "text-errorFill" : ""}`}>{formatNumber(Number(row[column.key]), column.type)}</div> : '-'
                      ) :
                        column.type === 'percent' ? (
                          row[column.key] ? <div className={`${(Number(row[column.key]) < 0) ? "text-errorFill" : ""}`}>{`${formatNumber(Number(row[column.key]))}%`}</div> : '-'
                        )
                          : column.render ? column.render(row, handleChange)
                            : renderCell ? renderCell(column, row)
                              : column.key.toLocaleLowerCase().includes('status') ? (
                                <div className={`flex items-center justify-center gap-2 whitespace-nowrap text-ellipsis overflow-hidden
                             ${(row[column.key] === t("tables.ACTIVE") || row[column.key] === t("tables.SENT") || row[column.key] === t("analysis.DONE")) ? "text-[#00A355]" :
                                    row[column.key] === t("tables.OVERDUE") || row[column.key] === t("analysis.ERROR") ? "text-errorFill" : row[column.key] === t("tables.SAVED") || row[column.key] === t("analysis.PROGRESS") ? "text-[#FF9066]" : "text-text01"} 
                             ${row[column.key] === t("tables.SENT") || row[column.key] === t("tables.ACTIVE") ? "rounded-2xl px-2 py-1 bg-[#D1FFEA]" : ""}
                             ${row[column.key] === t("tables.SAVED") ? "rounded-2xl px-2 py-1 bg-[#FFE6C7]" : ""}`}>
                                  {row[column.key] === t("tables.SENT") || row[column.key] === t("tables.ACTIVE") && (
                                    <span className="w-2 h-2 bg-[#00A355] rounded-full"></span>
                                  )}
                                  {row[column.key] === t("tables.SAVED") && (
                                    <span className="w-2 h-2 bg-[#FF9066] rounded-full"></span>
                                  )}
                                  {String(row[column.key])}
                                </div>
                              ) : (
                                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                                    {column.type === 'date' ? (
                                      row[column.key]
                                        ? TableUtils.createDateTimeWithoutComma(row[column.key] as Date | string, userTimezone)
                                        : '-'
                                    ) : column.type === 'period' ? (
                                      row[column.key] ? formatPeriodType(String(row[column.key])) : '-'
                                    ) : typeof row[column.key] === 'object' && row[column.key] !== null ? (
                                      `${(row[column.key] as unknown as Record<string, unknown>)?.name || ''} ${(row[column.key] as unknown as Record<string, unknown>)?.city || ''} ${(row[column.key] as unknown as Record<string, unknown>)?.location || ''} ${(row[column.key] as unknown as Record<string, unknown>)?.lat || ''} ${(row[column.key] as unknown as Record<string, unknown>)?.lon || ''}`
                                    ) : (
                                      // 🛠️ Ensure primitive types are safe for rendering
                                      String(row[column.key] ?? '-')
                                    )}
                                  </div>

                                </div>
                              )}
                    </td>
                  ))}
                  <Can
                    requiredPermissions={getRequiredPermissions(activePage?.path || "")}
                    userPermissions={userPermissions}
                  >
                    {(allowed) => allowed && isUpdate && (
                      <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                        <button className="flex items-center" onClick={() => onUpdate && onUpdate(row.id)}>
                          <img src={UpdateIcon} loading="lazy" alt="UPDATE" />
                        </button>
                      </td>
                    )}
                  </Can>
                </tr>
              ))}
              {currentData?.length > 0 && showTotal && (
                <tr className="h-11 px-3 bg-background05 text-sm font-semibold text-text01">
                  <td className="p-2 text-left" colSpan={3}>{t("finance.total")}</td>
                  {displayedColumns.slice(3).map((column) => (
                    <td key={column.key} className="p-2 text-right">
                      {column.type === 'number'
                        ? formatNumber(currentData.reduce((sum: number, row: { [x: string]: unknown; }) => sum + (Number(row[column.key]) || 0), 0))
                        : '-'}
                    </td>
                  ))}
                </tr>
              )}
              {currentData?.length > 0 && showTotalClean && (
                <tr className="h-11 px-3 bg-background05 text-sm font-semibold text-text01">
                  <td className="p-2 text-left" colSpan={2}>{t("finance.total")}</td>
                  {displayedColumns.slice(2).map((column) => (
                    <td key={column.key} className="p-2 text-right">
                      {column.type === 'number'
                        ? formatNumber(currentData.reduce((sum: number, row: { [x: string]: unknown; }) => sum + (Number(row[column.key]) || 0), 0))
                        : ''}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
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
          <ArrowLeftOutlined />
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
          <ArrowRightOutlined />
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
            storageKey=""
          />
        </Modal>
      </>}
    </>
  );
};

export default OverflowTable;
