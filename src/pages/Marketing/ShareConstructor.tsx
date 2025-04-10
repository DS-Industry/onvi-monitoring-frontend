import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import { useButtonCreate } from "@/components/context/useContext";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { getLoyaltyPrograms } from "@/services/api/marketing";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsLoyaltyPrograms } from "@/utils/OverFlowTableData";
import DynamicTable from "@/components/ui/Table/DynamicTable";

const ShareConstructor: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setRefreshKey(Date.now()); 
    }, []);

    useEffect(() => {
        if (buttonOn)
            navigate("/marketing/loyalty/rewards", { state: { ownerId: 0 } })
    }, [navigate, buttonOn]);

    const { data: loyaltyProgramsData, isLoading: loyaltyProgramsLoading } = useSWR([`get-loyalty-programs`, refreshKey], () => getLoyaltyPrograms(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const loyaltyPrograms = loyaltyProgramsData?.map((item) => ({
        ...item.props,
        status: t(`tables.${item.props.status}`)
    })) || [];

    return (
        <div className="mt-2">
            {notificationVisible && (
                <Notification
                    title={t("routes.loyalty")}
                    message={t("marketing.promotion")}
                    showBonus={true}
                    onClose={() => setNotificationVisible(false)}
                />
            )}
            <div className="mt-8">
                {loyaltyProgramsLoading ?
                    <TableSkeleton columnCount={columnsLoyaltyPrograms.length} />
                    : <DynamicTable
                        data={loyaltyPrograms.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())}
                        columns={columnsLoyaltyPrograms}
                        navigableFields={[{ key: "name", getPath: () => '/marketing/loyalty/bonus' }]}
                    />}
            </div>
        </div>
    )
}

export default ShareConstructor;