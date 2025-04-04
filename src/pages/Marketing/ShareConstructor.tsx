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
import { getOrganization } from "@/services/api/organization";
import { useCity } from "@/hooks/useAuthStore";

const ShareConstructor: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();
    const city = useCity();

    useEffect(() => {
        if (buttonOn)
            navigate("/marketing/share/constructor/bonus")
    }, [navigate, buttonOn]);

    const { data: loyaltyProgramsData, isLoading: loyaltyProgramsLoading } = useSWR([`get-loyalty-programs`], () => getLoyaltyPrograms(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const loyaltyPrograms = loyaltyProgramsData?.map((item) => ({
        ...item.props,
        organizationName: organizations.find((org) => item.props.organizationId === org.value)?.name
    })) || [];

    return (
        <div className="mt-2">
            {notificationVisible && (
                <Notification
                    title={t("routes.share")}
                    message={t("marketing.promotion")}
                    showBonus={true}
                    onClose={() => setNotificationVisible(false)}
                />
            )}
            <div className="mt-8">
                {loyaltyProgramsLoading ?
                    <TableSkeleton columnCount={columnsLoyaltyPrograms.length} />
                    : <DynamicTable
                        data={loyaltyPrograms}
                        columns={columnsLoyaltyPrograms}
                    />}
            </div>
        </div>
    )
}

export default ShareConstructor;