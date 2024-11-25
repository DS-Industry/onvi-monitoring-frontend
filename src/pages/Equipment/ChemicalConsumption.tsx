import NoDataUI from "@/components/ui/NoDataUI";
import React from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.svg?react"

const ChemicalConsumption: React.FC = () => {
    const { t } = useTranslation();
    return (
        <NoDataUI
            title={t("chemical.noText")}
            description={t("chemical.dont")}
        >
            <SalyImage className="mx-auto" />
        </NoDataUI>
    )
}

export default ChemicalConsumption;