import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsEmployees } from "@/utils/OverFlowTableData";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useSWR, { mutate } from "swr";
import { getWorkers } from "@/services/api/equipment";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import NoOverhead from "@/assets/NoOverhead.png";
import NoDataUI from "@/components/ui/NoDataUI";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import { getRoles, updateRole } from "@/services/api/organization";
import Button from "@/components/ui/Button/Button";
import useSWRMutation from "swr/mutation";

const ListOfEmployees: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [selectedWorker, setSelectedWorker] = useState<string>("");
    const [openModal, setOpenModal] = useState(false);
    const [roleId, setRoleId] = useState(0);
    const [workerId, setWorkerId] = useState(0);

    const { data: workerData, isLoading: loadingWorkers } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: rolesData } = useSWR([`get-role`], () => getRoles(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { trigger: update, isMutating } = useSWRMutation(['update-role'], async () => updateRole({
        userId: workerId,
        roleId: roleId
    }));


    const roles: { name: string, value: number }[] = rolesData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const workers: { id: number; name: string; position: string; roleName: string; status: string; createdAt: Date }[] = workerData?.map((item) => ({
        id: item.id,
        name: item.surname + " " + item.name + " " + item.middlename,
        position: item.position,
        roleName: item.roleName,
        status: t(`tables.${item.status}`),
        createdAt: item.createAt
    })) || [];

    const handleUpdate = (rowId: number) => {
        console.log("Row Id:", rowId);
        const worker = workers.find((work) => work.id === rowId)?.name || "";
        const workerRole = workers.find((role) => role.id === rowId)?.roleName || "";
        const roleNo = roles.find((role) => role.name === workerRole)?.value || 0;
        setWorkerId(rowId);
        setRoleId(roleNo);
        setSelectedWorker(worker)
        setOpenModal(true);
    }

    const handleUpdateRole = async () => {
        const result = await update();

        if (result) {
            console.log("Result of the api: ", result);
            mutate([`get-worker`]);
        }
    }

    return (
        <div>
            <Filter count={0} hideCity={true} hideDateTime={true} hideSearch={true}>
                <DropdownInput
                    title={t("roles.job")}
                    value={undefined}
                    options={[]}
                    classname="ml-2"
                />
                <DropdownInput
                    title={t("finance.status")}
                    value={undefined}
                    options={[]}
                    classname="ml-2"
                />
            </Filter>
            <div className="mt-5">
                {notificationVisible && (
                    <Notification
                        title={t("roles.access")}
                        message={t("roles.change")}
                        message2={t("roles.then")}
                        showEmp={true}
                        onClose={() => setNotificationVisible(false)}
                    />
                )}
                {loadingWorkers ?
                    <TableSkeleton columnCount={columnsEmployees.length} />
                    : workers.length > 0 ?
                        (<OverflowTable
                            tableData={workers}
                            columns={columnsEmployees}
                            isUpdate={true}
                            onUpdate={handleUpdate}
                        />) : (
                            <NoDataUI
                                title={t("organizations.noLegal")}
                                description={t("organizations.addLegal")}
                            >
                                <img src={NoOverhead} className="mx-auto" />
                            </NoDataUI>
                        )}
                {openModal && selectedWorker && (
                    <Modal isOpen={openModal} classname="p-10">
                        <div className="flex flex-row items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-text01">{t("roles.role")}</h2>
                            <Close onClick={() => setOpenModal(false)} className="cursor-pointer text-text01" />
                        </div>
                        <p className="text-primary02">{selectedWorker}</p>
                        <DropdownInput
                            value={roleId}
                            options={roles}
                            onChange={(value) => setRoleId(value)}
                            classname="w-80"
                        />
                        <div className="flex justify-end space-x-4 mt-10">
                            <Button
                                title={t("organizations.cancel")}
                                type='outline'
                                handleClick={() => setOpenModal(false)}
                            />
                            <Button
                                title={t("organizations.save")}
                                // form={true}
                                isLoading={isMutating}
                                handleClick={handleUpdateRole}
                            />
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    )
}

export default ListOfEmployees;