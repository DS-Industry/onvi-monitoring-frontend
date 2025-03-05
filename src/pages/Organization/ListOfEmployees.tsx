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


    const roles: { name: string, value: number }[] = rolesData?.map((item) => ({
        name: item.name,
        value: item.id,
        render: (
            <div>
                <div>{item.name}</div>
                <div className="text-text02">Lorem ipsum dolor, sit amet consectetur</div>
            </div>
        )
    })) || [];

    const workers: {
        id: number;
        name: string;
        position: string;
        roleName: string;
        status: string;
        createdAt: string;
    }[] = workerData?.map((item) => ({
        id: item.id,
        name: `${item.surname} ${item.name} ${item.middlename}`,
        position: item.position,
        roleName: item.roleName,
        status: t(`tables.${item.status}`),
        createdAt: item.createAt
            ? new Date(item.createAt).toLocaleDateString("ru-RU")
            : "N/A"
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
                <Notification
                    title={t("roles.access")}
                    message={t("roles.change")}
                    message2={t("roles.then")}
                    showEmp={true}
                />
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
                    <Modal isOpen={openModal} classname="w-[552px] h-[300px]">
                        <div className="flex items-center justify-between">
                            <div></div>
                            <Close onClick={() => setOpenModal(false)} className="cursor-pointer text-text01" />
                        </div>
                        <h2 className="text-2xl font-semibold text-text01 mb-4">{t("roles.role")}</h2>
                        <p className="text-primary02 text-sm">{selectedWorker}</p>
                        <DropdownInput
                            value={roleId}
                            options={roles}
                            onChange={(value) => setRoleId(value)}
                            classname="w-[456px]"
                            renderOption={(option) => option.render || <span>{option.name}</span>}
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