import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import useSWR from "swr";
import { getWorkers, WorkerResponse } from "@/services/api/equipment";
import { getRoles } from "@/services/api/organization";
import { useButtonCreate } from "@/components/context/useContext";
import { usePermissions } from "@/hooks/useAuthStore";
import { Table, Tooltip } from "antd";
import hasPermission from "@/permissions/hasPermission";
import { EditOutlined } from "@ant-design/icons";
import AntDButton from "antd/es/button";
import { ColumnsType } from "antd/es/table";
import { getStatusTagRender } from "@/utils/tableUnits";
import EmployeeCreationModal from "./EmployeeCreationModal";
import EmployeeUpdateModal from "./EmployeeUpdateModal";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";

const ListOfEmployees: React.FC = () => {
  const { t } = useTranslation();
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleId, setRoleId] = useState(0);
  const [workerId, setWorkerId] = useState(0);
  const { buttonOn } = useButtonCreate();

  const { data: workerData, isLoading: loadingWorkers } = useSWR(
    [`get-worker`],
    () => getWorkers(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: rolesData } = useSWR([`get-role`], () => getRoles(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const roles: { name: string; value: number }[] =
    rolesData?.map((item) => ({
      name: item.name,
      value: item.id,
      render: (
        <div>
          <div>{item.name}</div>
          <div className="text-text02">
            Lorem ipsum dolor, sit amet consectetur
          </div>
        </div>
      ),
    })) || [];

  useEffect(() => {
    if (buttonOn) setIsModalOpen(true);
  }, [buttonOn]);

  const workers =
    workerData?.map((item) => ({
      ...item,
      name: `${item.surname} ${item.name} ${item.middlename}`,
      status: t(`tables.${item.status}`),
      createdAt: item.createAt
        ? new Date(item.createAt).toLocaleDateString("ru-RU")
        : "N/A",
    })) || [];

  const handleUpdate = (rowId: number) => {
    const worker = workers.find((work) => work.id === rowId)?.name || "";
    const workerRole =
      workers.find((role) => role.id === rowId)?.roleName || "";
    const roleNo = roles.find((role) => role.name === workerRole)?.value || 0;
    setWorkerId(rowId);
    setRoleId(roleNo);
    setSelectedWorker(worker);
    setOpenModal(true);
  };

  const userPermissions = usePermissions();

  const allowed = hasPermission(userPermissions, [
    { action: "manage", subject: "Organization" },
    { action: "update", subject: "Organization" },
  ]);

  const statusRender = getStatusTagRender(t);

  const columnsEmployees: ColumnsType<WorkerResponse> = [
    {
      title: "ФИО Сотрудника",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Должность",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Роль СRM",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: statusRender,
    },
    {
      title: "Работает с",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  if (allowed) {
    columnsEmployees.push({
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: (_: unknown, record: { id: number }) => (
        <Tooltip title="Редактировать">
          <AntDButton
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: "24px" }}
          />
        </Tooltip>
      ),
    });
  }

  const {
    checkedList,
    setCheckedList,
    options: columnOptions,
    visibleColumns,
  } = useColumnSelector(columnsEmployees, "employees-columns");

  return (
    <div>
      <div className="mt-5">
        <Notification
          title={t("roles.access")}
          message={t("roles.change")}
          message2={t("roles.then")}
          showEmp={true}
        />
        <ColumnSelector
          checkedList={checkedList}
          options={columnOptions}
          onChange={setCheckedList}
        />
        <Table
          dataSource={workers}
          columns={visibleColumns}
          pagination={false}
          loading={loadingWorkers}
        />
        <EmployeeUpdateModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          workerId={workerId}
          roleId={roleId}
          setRoleId={setRoleId}
          selectedWorker={selectedWorker}
        />
        <EmployeeCreationModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </div>
    </div>
  );
};

export default ListOfEmployees;
