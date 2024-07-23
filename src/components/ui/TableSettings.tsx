import React from "react";
import Close from "../../assets/icons/close.svg?react";
import Search from "../../assets/icons/search.svg?react";

const TableSettings: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between">
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
          <Close />
        </div>
      </div>
    </>
  );
};

export default TableSettings;
