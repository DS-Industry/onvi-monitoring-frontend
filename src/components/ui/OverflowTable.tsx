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
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
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
              {selectedColumns.includes("id") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-medium text-primary02 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.id}
                  </div>
                </td>
              )}
              {selectedColumns.includes("firstName") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-primary02 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.firstName}
                  </div>
                </td>
              )}
              {selectedColumns.includes("lastName") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-primary02 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.lastName}
                  </div>
                </td>
              )}
              {selectedColumns.includes("middleName") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.middleName}
                  </div>
                </td>
              )}

              {selectedColumns.includes("age") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.age}
                  </div>
                </td>
              )}
              {selectedColumns.includes("gender") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.gender}
                  </div>
                </td>
              )}
              {selectedColumns.includes("email") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.email}
                  </div>
                </td>
              )}
              {selectedColumns.includes("phone") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.phone}
                  </div>
                </td>
              )}
              {selectedColumns.includes("username") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.username}
                  </div>
                </td>
              )}
              {selectedColumns.includes("password") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.password}
                  </div>
                </td>
              )}
              {selectedColumns.includes("birthDate") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.birthDate}
                  </div>
                </td>
              )}
              {selectedColumns.includes("image") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.image}
                  </div>
                </td>
              )}
              {selectedColumns.includes("bloodGroup") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.bloodGroup}
                  </div>
                </td>
              )}
              {selectedColumns.includes("height") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.height}
                  </div>
                </td>
              )}
              {selectedColumns.includes("weight") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.weight}
                  </div>
                </td>
              )}
              {selectedColumns.includes("eyeColor") && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.eyeColor}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OverflowTable;
