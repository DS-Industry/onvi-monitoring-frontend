import NoDataUI from "@/components/ui/NoDataUI";
import React from "react";
import OverheadsEmpty from "@/assets/NoOverhead.png"
import { useTranslation } from "react-i18next";

const OverheadCosts: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <NoDataUI
                title={t("warehouse.noOverhead")}
                description={""}
            >
                <img src={OverheadsEmpty} className="mx-auto" />
            </NoDataUI>
        </>
    )
}

export default OverheadCosts;