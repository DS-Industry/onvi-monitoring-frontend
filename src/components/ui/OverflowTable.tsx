import React from "react";

const tableData = [
  {
    id: 1,
    firstName: "Emily",
    lastName: "Johnson",
    maidenName: "Smith",
    age: 28,
    gender: "female",
    email: "emily.johnson@x.dummyjson.com",
    phone: "+81 965-431-3024",
    username: "emilys",
    password: "emilyspass",
    birthDate: "1996-5-30",
    image: "...",
    bloodGroup: "O-",
    height: 193.24,
    weight: 63.16,
    eyeColor: "Green",
  },
];

const columns = [
  "id",
  "firstName",
  "lastName",
  "maidenName",
  "age",
  "gender",
  "email",
  "phone",
  "username",
  "password",
  "birthDate",
  "image",
  "bloodGroup",
  "height",
  "weight",
  "eyeColor",
];

const OverflowTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-3 py-8 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-text01 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.id}>
              <td className="py-6 px-3 whitespace-nowrap text-sm font-medium text-primary02 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.id}
                </div>
              </td>
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-primary02 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.firstName}
                </div>
              </td>
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.maidenName}
                </div>
              </td>
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-primary02 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.lastName}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.age}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.gender}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.email}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.phone}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.username}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.password}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.birthDate}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.image}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.bloodGroup}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.height}
                </div>
              </td>{" "}
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.weight}
                </div>
              </td>
              <td className="py-6 px-3 whitespace-nowrap text-sm font-semibold text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.eyeColor}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OverflowTable;
