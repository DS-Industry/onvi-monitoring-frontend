import React, { useState } from "react";
import UpdateIcon from "@icons/PencilIcon.png";
import FolderIcon from "@icons/folder.svg?react";
import { usePermissions } from "@/hooks/useAuthStore";
import { Can } from "@/permissions/Can";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";

interface TableColumn {
  label: string;
  key: string;
  type?: "date" | "string" | "number" | string;
}

type TreeData = {
  id: number;
  name: string;
  description?: string;
  children?: TreeData[];
  isExpanded?: boolean;
  [key: string]: unknown;
};

type Props = {
  treeData: TreeData[];
  columns: TableColumn[];
  isUpdate?: boolean;
  isDisplayEdit?: boolean;
  onUpdate?: (id: number) => void;
  handleChange?: (id: number, key: string, value: string | number) => void;
};

const TreeTable: React.FC<Props> = ({
  treeData,
  columns,
  isUpdate,
  onUpdate,
}: Props) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const userPermissions = usePermissions();

  const renderRows = (
    data: TreeData[],
    level: number = 0
  ): React.ReactElement[] => {
    return data.map((row) => (
      <React.Fragment key={row.id}>
        <tr>
          <Can
            requiredPermissions={[
              { action: "manage", subject: "Warehouse" },
              { action: "update", subject: "Warehouse" },
            ]}
            userPermissions={userPermissions}
          >
            {(allowed) =>
              allowed &&
              isUpdate && (
                <td className="border-b border-[#E4E5E7] bg-background02 py-2.5 px-2 text-start">
                  <button onClick={() => onUpdate && onUpdate(row.id)}>
                    <img src={UpdateIcon} loading="lazy" alt="UPDATE" />
                  </button>
                </td>
              )
            }
          </Can>
          {columns.map((column) => (
            <td
              key={column.key}
              className={`border-b border-x-4 border-b-[#E4E5E7] border-x-background02 bg-background02 py-2 px-2.5 text-start whitespace-nowrap text-sm first:text-primary02 text-text01 overflow-hidden overflow-x-visible`}
            >
              {column.key === "name" ? (
                <div
                  className="flex items-center gap-2 cursor-pointer uppercase"
                  style={{ paddingLeft: `${level * 20}px` }}
                >
                  {row.children && row.children.length > 0 && (
                    <button
                      className="text-text02"
                      onClick={() => toggleRowExpansion(row.id)}
                    >
                      {expandedRows.has(row.id) ? (
                        <MinusCircleOutlined className="h-4 w-4" />
                      ) : (
                        <PlusCircleOutlined className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <FolderIcon />
                  <span className="flex justify-center items-center">
                    {row[column.key]}
                  </span>
                </div>
              ) : (
                <span>
                  {typeof row[column.key] === "undefined" ||
                  row[column.key] === null
                    ? "-"
                    : String(row[column.key])}
                </span>
              )}
            </td>
          ))}
        </tr>
        {expandedRows.has(row.id) &&
          row.children &&
          renderRows(row.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full h-64 lg:h-96 overflow-x-auto overflow-y-auto mb-16">
      <table className="w-full">
        <thead>
          <tr>
            <Can
              requiredPermissions={[
                { action: "manage", subject: "Warehouse" },
                { action: "update", subject: "Warehouse" },
              ]}
              userPermissions={userPermissions}
            >
              {(allowed) =>
                allowed &&
                isUpdate && (
                  <th className="border border-background02 bg-background06 w-11"></th>
                )
              }
            </Can>
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-b border-x-2 border-background02 bg-background06 px-2.5 py-5 text-start text-sm font-semibold text-text01 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderRows(treeData)}</tbody>
      </table>
    </div>
  );
};

export default TreeTable;
