import NoDataUI from "@/components/ui/NoDataUI";
import React from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.svg?react"

const DailyReports: React.FC = () => {
    const { t } = useTranslation();
    return (
        <NoDataUI
            title={t("daily.noText")}
            description={t("daily.create")}
        >
            <SalyImage className="mx-auto" />
        </NoDataUI>
    )
}

export default DailyReports;