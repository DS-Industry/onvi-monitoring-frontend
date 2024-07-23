import React from "react";

type Props = {
  tableData: {
    id?: number;
    firstName?: string;
    lastName?: string;
    maidenName?: string;
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
  }[];
  columns: string[];
};

const OverflowTable: React.FC<Props> = ({ tableData, columns }: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-[#E4E5E7] bg-[#FCFCFD] px-3 py-8 text-left text-sm font-semibold text-text01 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.id}>
              {row.id && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-medium text-primary02 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.id}
                  </div>
                </td>
              )}
              {row.firstName && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-primary02 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.firstName}
                  </div>
                </td>
              )}
              {row.maidenName && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.maidenName}
                  </div>
                </td>
              )}
              {row.lastName && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-primary02 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.lastName}
                  </div>
                </td>
              )}
              {row.age && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.age}
                  </div>
                </td>
              )}
              {row.gender && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.gender}
                  </div>
                </td>
              )}
              {row.email && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.email}
                  </div>
                </td>
              )}
              {row.phone && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.phone}
                  </div>
                </td>
              )}
              {row.username && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.username}
                  </div>
                </td>
              )}
              {row.password && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.password}
                  </div>
                </td>
              )}
              {row.birthDate && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.birthDate}
                  </div>
                </td>
              )}
              {row.image && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.image}
                  </div>
                </td>
              )}
              {row.bloodGroup && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.bloodGroup}
                  </div>
                </td>
              )}
              {row.height && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.height}
                  </div>
                </td>
              )}
              {row.weight && (
                <td className="border-b border-[#E4E5E7] py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                    {row.weight}
                  </div>
                </td>
              )}
              {row.eyeColor && (
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
