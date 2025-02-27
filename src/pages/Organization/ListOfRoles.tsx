import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsRoles } from "@/utils/OverFlowTableData";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Button from "@/components/ui/Button/Button";
import useSWR from "swr";
import { getRoles } from "@/services/api/organization";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useButtonCreate } from "@/components/context/useContext";

const ListOfRoles: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const { buttonOn, setButtonOn } = useButtonCreate();

    const { data: rolesData, isLoading: loadingRoles } = useSWR([`get-role`], () => getRoles(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const roles = rolesData || [];

    return (
        <div>
            {notificationVisible && (
                <Notification
                    title={t("roles.access")}
                    message={t("roles.the")}
                    showEmp={true}
                    onClose={() => setNotificationVisible(false)}
                />
            )}
            {loadingRoles ?
                <TableSkeleton columnCount={columnsRoles.length} />
                : <OverflowTable
                    tableData={roles}
                    columns={columnsRoles}
                />}
            <DrawerCreate>
                <form className="space-y-6">
                    <span className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("roles.create")}</span>
                    <div className="mb-5 flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-errorFill">*</span>
                        <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
                    </div>
                    <Input
                        title={t("roles.name")}
                        label={t("roles.enter")}
                        classname="w-96"
                    />
                    <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("roles.desc")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <div className="text-text01">{t("roles.acc")}</div>
                    </div>
                    <div className="flex">
                        <div className="text-text01 font-semibold text-lg">{t("routes.accessRights")}</div>
                        <span className="text-errorFill">*</span>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => { setButtonOn(!buttonOn); }}
                        />
                        <Button
                            title={t("roles.create")}
                            form={true}
                            // isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    )
}

export default ListOfRoles;