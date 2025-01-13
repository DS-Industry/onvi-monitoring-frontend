import React, { useState } from "react";
import Edit from "@icons/edit.svg?react";
import moment from 'moment';
import UpdateIcon from "@icons/PencilIcon.png";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal.tsx";
import TableSettings from "./TableSettings.tsx";
import SavedIcon from "@icons/SavedIcon.png";
import SentIcon from "@icons/SentIcon.png";
import CheckIcon from "@icons/checkSuccess.png";
import { usePageNumber, useSetDocumentType } from "@/hooks/useAuthStore.ts";
import Icon from 'feather-icons-react';

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
  isCheck
}: Props) => {

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map((col) => col.key)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = usePageNumber();

  const displayedColumns = columns.filter((column) => selectedColumns.includes(column.key));
  const totalPages = Math.ceil(tableData?.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = tableData?.slice(startIndex, startIndex + rowsPerPage);

  const navigate = useNavigate();
  const setDocumentType = useSetDocumentType();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return num.toString();
    return num.toLocaleString("en-IN");
  };

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
  
      if (currentPage > 3) range.push("...");
  
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) range.push(i);
  
      if (currentPage < totalPages - 2) range.push("...");
  
      range.push(totalPages);
    }
  
    return range;
  };  

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") setCurrentPage(page);
  };

  return (
    <>
      <div className="w-full overflow-auto">
        <div className="overflow-x-auto">

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
                {isUpdateLeft && <th className="border border-background02 bg-background06 w-11"></th>}
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
                {isUpdate && <th className="border border-background02 bg-background06 w-11"></th>}
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
                  {isUpdateLeft && (
                    <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                      <button className="flex items-center" onClick={() => onUpdate && onUpdate(row.id)}>
                        <img src={UpdateIcon} />
                      </button>
                    </td>
                  )}
                  {displayedColumns.map((column) => (
                    <td key={column.key} className="border-b border-x-4 border-b-[#E4E5E7] border-x-background02 bg-background02 py-2 px-2.5 text-start whitespace-nowrap text-sm first:text-primary02 text-text01 overflow-hidden overflow-x-visible">
                      {column.key === 'name' && nameUrl ? (
                        <span
                          className="cursor-pointer"
                          onClick={() => { navigate(`${nameUrl}`, { state: { ownerId: row.id, name: row.name, status: row.status } }); setDocumentType(row.type) }}
                        >
                          <div className="whitespace-nowrap text-ellipsis overflow-hidden text-primary02">
                            {row[column.key]}
                          </div>
                        </span>
                      ) : column.render ? column.render(row, handleChange)
                        : column.key === 'status' ? (
                          <div className={`whitespace-nowrap text-ellipsis overflow-hidden ${row[column.key] === "ACTIVE" ? "text-[#00A355]" : "text-text01"}`}>
                            {row[column.key]}
                          </div>
                        ) : (
                          <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                            {column.type === 'date' ? (
                              row[column.key] ? moment(row[column.key]).format('DD.MM.YYYY HH:mm:ss') : '-'
                            ) : column.type === 'number' ? (
                              row[column.key] ? formatNumber(row[column.key]) : '-'
                            ) : typeof row[column.key] === 'object' ? (
                              `${row[column.key]?.name || ''} ${row[column.key]?.city || ''} ${row[column.key]?.location || ''} ${row[column.key]?.lat || ''} ${row[column.key]?.lon || ''}`
                            ) : (
                              row[column.key]
                            )}
                          </div>
                        )}
                    </td>
                  ))}
                  {isUpdate && (
                    <td className="border-b border-[#E4E5E7] bg-background02 py-2 px-2.5 text-start">
                      <button className="flex items-center" onClick={() => onUpdate && onUpdate(row.id)}>
                        <img src={UpdateIcon} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`px-2 py-1 ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
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
              className={`px-4 py-2 font-semibold ${currentPage === page ? "bg-white text-primary02 rounded-lg border border-primary02" : "text-text01"}`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-text01"}`}
        >
          <Icon icon="chevron-right" />
        </button>
      </div>
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
