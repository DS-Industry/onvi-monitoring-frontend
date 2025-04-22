import React, { useState } from "react";
import Close from "@icons/close.svg?react";
import SearchInput from "../Input/SearchInput";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const colums = columns?.filter((item: TableColumn) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  // const columnGroups: { [key: string]: TableColumn[] } = {
  //   "Данные по объектам": colums.filter((col) => col.key == "id" || col.key == 'name' || col.key == 'address'),
  //   "Данные по зачислениям": colums.filter((col) => col.key != "id" && col.key != 'name' && col.key != 'address'),
  // };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-text01">{t("roles.cols")}</h2>
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
          <SearchInput
            placeholder="Поиск"
            value={searchTerm}
            onChange={handleSearchChange}
            searchType="outlined"
            classname="w-full sm:w-auto"
          />
          <Close onClick={onIsModalOpen} className="cursor-pointer" />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column - List of Column Labels */}
        <div className="w-full lg:w-1/3 space-y-1">
          {columns.map((column) => (
            <div key={column.key} className="text-base text-text01">
              {column.label}
            </div>
          ))}
        </div>

        {/* Right Column - Grouped Checkboxes */}
        <div className="w-full lg:w-2/3 bg-disabledFill p-5 rounded-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-text01">{t("roles.select")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {colums.map((column) => (
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
        </div>
      </div>
    </>
  );
};

export default TableSettings;
