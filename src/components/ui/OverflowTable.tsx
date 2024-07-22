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

const OverflowTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              firstName
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              lastName
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              maidenName
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              age
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              gender
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              email
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              phone
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              username
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              password
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              birthDate
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              image
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              bloodGroup
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              height
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              weight
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              eyeColor
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.id}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.firstName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.maidenName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.lastName}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.age}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.gender}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.email}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.phone}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.username}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.password}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.birthDate}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.image}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.bloodGroup}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.height}
                </div>
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {row.weight}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 overflow-hidden overflow-x-visible">
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
