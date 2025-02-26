import React, { useState } from "react";
import Edit from "@icons/edit.svg?react";
import UpdateIcon from "@icons/PencilIcon.png";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal.tsx";
import TableSettings from "./TableSettings.tsx";
import SavedIcon from "@icons/SavedIcon.png";
import SentIcon from "@icons/SentIcon.png";
import CheckIcon from "@icons/checkSuccess.png";
import { useCurrentPage, usePageNumber, usePageSize, usePermissions, useSetCurrentPage, useSetDocumentType } from "@/hooks/useAuthStore.ts";
import Icon from 'feather-icons-react';
import { Can } from "@/permissions/Can.tsx";
import routes from "@/routes/index.tsx";
import { useFilterOn } from "@/components/context/useContext.tsx";
import { useTranslation } from "react-i18next";

interface TableColumn {
  label: string;
  key: string;
  type?: "date" | "string" | "number" | string;
  render?: any;
}

type Props = {
  tableData: any;
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
  renderCell?: (column: any, row: any) => React.ReactNode;
  showPagination?: boolean;
  showTotalClean?: boolean;
};

const OverflowTable: React.FC<Props> = ({
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
}: Props) => {

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

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return num.toString();
    return new Intl.NumberFormat("en-US").format(num);
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
  // const handlePrevious = () => {
  //   setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  // };

  // const handleNext = () => {
  //   setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  // };

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
        <div className="max-w-7xl overflow-x-auto">
          {title && (
            <span
              className="cursor-pointer"
              onClick={() => navigate(`${nameUrlTitle}`, { state: { ownerId: urlTitleId } })}
            >
              <div className=" text-xl md:text-2xl text-primary02">
                {title}
              </div>
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
                        className="border-b border-x-2 border-background02 bg-background06 px-2.5 py-5 text-start text-sm font-semibold text-text01 uppercase tracking-wider"
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
              {currentData?.map((row: any) => (
                <tr key={row.id}>
                  {isCheck && (
                    <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                      {row.status === "FINISHED" && <img src={CheckIcon} />}
                    </td>
                  )}
                  {isStatus && (
                    <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                      {row.status === "SENT" ? <img src={SentIcon} /> : <img src={SavedIcon} />}
                    </td>
                  )}
                  <Can
                    requiredPermissions={getRequiredPermissions(activePage?.path || "")}
                    userPermissions={userPermissions}
                  >
                    {(allowed) => allowed && isUpdateLeft && (
                      <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                        <button className="flex items-center" onClick={() => onUpdate && onUpdate(row.id)}>
                          <img src={UpdateIcon} />
                        </button>
                      </td>
                    )}
                  </Can>
                  {displayedColumns.map((column) => (
                    <td key={column.key} className="border-b border-x-4 border-b-[#E4E5E7] border-x-background02 bg-background02 py-2 px-2.5 text-right whitespace-nowrap text-sm first:text-primary02 text-text01 overflow-hidden overflow-x-visible">
                      {(column.key === 'name' || column.key === 'posName') && nameUrl ? (
                        <span
                          className="cursor-pointer"
                          onClick={() => { navigate(`${nameUrl}`, { state: { ownerId: row.id, name: row.name, status: row.status, type: row.type, workDate: row.startWorkDate, endDate: row.endSpecifiedDate } }); setDocumentType(documentTypes.find((doc) => doc.name === row.type)?.value || "") }}
                        >
                          <div className="whitespace-nowrap text-ellipsis overflow-hidden text-primary02">
                            {row[column.key]}
                          </div>
                        </span>
                      ) : column.type === 'number' ? (
                        row[column.key] ? <div className={`${(row[column.key] < 0 || (column.key === "shortageDeviceType" && row[column.key] > 0)) ? "text-errorFill" : ""}`}>{formatNumber(row[column.key])}</div> : '-'
                      )
                        : column.render ? column.render(row, handleChange)
                          : renderCell ? renderCell(column, row)
                            : column.key.toLocaleLowerCase().includes('status') ? (
                              <div className={`flex items-center gap-2 whitespace-nowrap text-ellipsis overflow-hidden
                             ${(row[column.key] === t("tables.ACTIVE") || row[column.key] === t("tables.SENT")) ? "text-[#00A355]" :
                                  row[column.key] === t("tables.OVERDUE") ? "text-errorFill" : row[column.key] === t("tables.SAVED") ? "text-[#FF9066]" : "text-text01"} 
                             ${row[column.key] === t("tables.SENT") || row[column.key] === t("tables.ACTIVE") ? "rounded-2xl px-2 py-1 bg-[#D1FFEA]" : ""}
                             ${row[column.key] === t("tables.SAVED") ? "rounded-2xl px-2 py-1 bg-[#FFE6C7]" : ""}`}>
                                {row[column.key] === t("tables.SENT") || row[column.key] === t("tables.ACTIVE") && (
                                  <span className="w-2 h-2 bg-[#00A355] rounded-full"></span>
                                )}
                                {row[column.key] === t("tables.SAVED") && (
                                  <span className="w-2 h-2 bg-[#FF9066] rounded-full"></span>
                                )}
                                {row[column.key]}
                              </div>
                            ) : (
                              <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                                {column.type === 'date' ? (
                                  row[column.key]
                                    ? new Date(row[column.key]).toLocaleString("ru-RU", {
                                      timeZone: userTimezone,
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })
                                    : '-'
                                ) : column.type === "period" ? (
                                  row[column.key] ? formatPeriodType(row[column.key]) : '-'
                                ) : typeof row[column.key] === 'object' ? (
                                  `${row[column.key]?.name || ''} ${row[column.key]?.city || ''} ${row[column.key]?.location || ''} ${row[column.key]?.lat || ''} ${row[column.key]?.lon || ''}`
                                ) : (
                                  row[column.key]
                                )}
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
                          <img src={UpdateIcon} />
                        </button>
                      </td>
                    )}
                  </Can>
                </tr>
              ))}
              {currentData.length > 0 && showTotal && (
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
              {currentData.length > 0 && showTotalClean && (
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
          />
        </Modal>
      </>}
    </>
  );
};

export default OverflowTable;
