import React from "react";

interface TableColumn {
  label: string;
  key: string;
}

interface TableData {
  id?: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  birthDate?: string;
  image?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
}

type Props = {
  tableData: TableData[];
  columns: TableColumn[];
  selectedColumns: string[];
};

const OverflowTable: React.FC<Props> = ({
  tableData,
  columns,
  selectedColumns,
}: Props) => {
  console.log(selectedColumns.includes("eyeColor"));

  const displayedColumns = columns.filter((column) => selectedColumns.includes(column.key));

  return (
    <div className="w-64 md:container">
      <div className="overflow-x-auto">
        <table className="max-w-full">
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
                    <td key={column.key} className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-primary02 overflow-hidden overflow-x-visible">
                      <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                        {row[column.key]} {/* Обращаемся к свойству row по ключу column.key */}
                      </div>
                    </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverflowTable;
