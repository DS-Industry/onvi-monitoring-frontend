import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsEmployees } from "@/utils/OverFlowTableData";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";

const ListOfEmployees: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);

    return (
        <div>
            <Filter count={0} hideCity={true} hideDateTime={true}>
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
                <OverflowTable
                    tableData={[]}
                    columns={columnsEmployees}
                    isUpdate={true}
                />
            </div>
        </div>
    )
}

export default ListOfEmployees;