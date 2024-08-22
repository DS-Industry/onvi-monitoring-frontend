import React from "react";
import Close from "../../../assets/icons/close.svg?react";
import Search from "../../../assets/icons/search.svg?react";

interface TableColumn {
  label: string;
  key: string;
}

type Props = {
  columns: TableColumn[];
  selectedColumns: string[];
  onColumnToggle: (key: string) => void;
  onIsModalOpen: () => void;
};
const TableSettings: React.FC<Props> = ({
  columns,
  selectedColumns,
  onColumnToggle,
  onIsModalOpen,
}: Props) => {
  return (
    <>
      <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 items-center justify-between mb-8">
        <h2 className="text-3xl">Колонки в таблице</h2>
        <div className="flex items-center gap-12">
          <div className="relative">
            <input
              type="text"
              placeholder="search"
              className="pl-10 pr-4 py-2 border border-opacity01 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-opacity01" />
            </div>
          </div>
          <Close onClick={onIsModalOpen} className="cursor-pointer" />
        </div>
      </div>

      <div className="bg-[#F7F9FC] p-5 rounded-2xl grid grid-cols-3 gap-5">
        {columns.map((column) => (
          <label key={column.key} className="mr-4">
            <input
              type="checkbox"
              checked={selectedColumns.includes(column.key)}
              onChange={() => onColumnToggle(column.key)}
              className="mr-2"
            />
            {column.label}
          </label>
        ))}
      </div>
    </>
  );
};

export default TableSettings;
