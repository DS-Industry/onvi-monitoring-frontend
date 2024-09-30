import React, {useState} from "react";
import Edit from "@icons/edit.svg?react";
import moment from 'moment';
import UpdateIcon from "@icons/update-icon.svg?react";
import {useNavigate} from "react-router-dom";
import Modal from "../Modal.tsx";
import TableSettings from "./TableSettings.tsx";

interface TableColumn {
  label: string;
  key: string;
  type?: "date" | "string" | "number"
}

type Props = {
  tableData: any;
  columns: TableColumn[];
  isUpdate?: boolean;
  isDisplayEdit?: boolean;
  nameUrl?: string;
  title?: string;
  nameUrlTitle?: string;
  urlTitleId?: number;
};

const OverflowTable: React.FC<Props> = ({
  tableData,
  columns,
  isUpdate,
  isDisplayEdit,
  nameUrl,
  title,
  nameUrlTitle,
  urlTitleId,
}: Props) => {

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
      columns.map((col) => col.key)
  );
  const displayedColumns = columns.filter((column) => selectedColumns.includes(column.key));
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prev) =>
        prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  return (
      <>
        <div className="w-64 md:container mb-16">
          <div className="overflow-x-auto">

            { title && (

                    <span
                        className="cursor-pointer"
                        onClick={() => navigate(`${nameUrlTitle}`, {state:{ownerId:urlTitleId}})}
                    >
                            <div className=" text-xl md:text-2xl text-blue-500">
                              {title}
                            </div>
                          </span>
                )
            }

            <table className="w-full">
              <thead>
                <tr>
                  {columns.map(
                    (column) =>
                      selectedColumns.includes(column.key) && (
                        <th
                          key={column.key}
                          className="border-b border-[#E4E5E7] bg-[#FCFCFD] px-3 py-8 text-left text-sm font-semibold text-text01 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      )
                  )}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id}>
                    {displayedColumns.map((column) => (
                        <td key={column.key} className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                          {column.key === 'name' && nameUrl ? (
                              // Проверяем, является ли текущая колонка 'name'
                              <span
                                  className="cursor-pointer"
                                  onClick={() => navigate(`${nameUrl}`, {state:{ownerId:row.id}})}
                              >
                            <div className="whitespace-nowrap text-ellipsis overflow-hidden text-blue-500">
                              {row[column.key]}
                            </div>
                          </span>
                          ) : (
                              <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                                {column.type === 'date' &&
                                    (row[column.key] ? moment(row[column.key]).format('DD-MM-YYYY HH:mm:ss') : '-') ||
                                    row[column.key]}
                              </div>
                          )}
                        </td>
                    ))}
                    {isUpdate && <td
                        className="border-b border-[#E4E5E7] py-6 px-3 text-center"> {/* Добавьте text-center для центрирования кнопки */}
                      <button className="flex items-center">
                        <UpdateIcon/>
                      </button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isDisplayEdit &&<>
          <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary02 text-sm font-semibold flex items-center gap-2 mt-1.5 py-2"
          >
            Настройки таблицы <Edit/>
          </button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
