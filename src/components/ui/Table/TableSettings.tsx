import React, { useState } from "react";
import Close from "@icons/close.svg?react";
import SearchInput from "../Input/SearchInput";

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

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const colums = columns?.filter((item: any) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const columnGroups: { [key: string]: TableColumn[] } = {
    "Данные по объектам": colums.filter((col) => col.key == "id" || col.key == 'name' || col.key == 'address'),
    "Данные по зачислениям": colums.filter((col) => col.key != "id" && col.key != 'name' && col.key != 'address'),
  };
  return (
    <>
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-text01">Колонки в таблице</h2>
        <div className="flex items-center gap-6">
          <SearchInput
            placeholder="Поиск"
            value={searchTerm}
            onChange={handleSearchChange}
            searchType="outlined"
          />
          <Close onClick={onIsModalOpen} className="cursor-pointer" />
        </div>
      </div>

      <div className="flex">
        <div className="w-1/3 pr-4 space-y-1">
          {colums.map((column) => (
            <div key={column.key} className="text-base text-text01">
              {column.label}
            </div>
          ))}
        </div>

        <div className="w-2/3 bg-disabledFill p-5 rounded-2xl">
          {Object.keys(columnGroups).map((groupName) => (
            <div key={groupName} className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-text01">{groupName}</h3>
              <div className="grid grid-cols-3 gap-4">
                {columnGroups[groupName].map((column) => (
                  <label key={column.key} className="flex items-center text-base text-text01">
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TableSettings;
