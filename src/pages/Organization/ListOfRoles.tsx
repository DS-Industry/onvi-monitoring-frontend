import React from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsRoles } from "@/utils/OverFlowTableData";
import useSWR from "swr";
import { getRoles } from "@/services/api/organization";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";


const ListOfRoles: React.FC = () => {
    const { t } = useTranslation();

    const { data: rolesData, isLoading: loadingRoles } = useSWR([`get-role`], () => getRoles(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const roles = rolesData || [];

    return (
        <div>
            <Notification
                title={t("roles.access")}
                message={t("roles.the")}
                showEmp={true}
            />
            {loadingRoles ?
                <TableSkeleton columnCount={columnsRoles.length} />
                : <OverflowTable
                    tableData={roles}
                    columns={columnsRoles}
                />}
        </div>
    )
}

export default ListOfRoles;