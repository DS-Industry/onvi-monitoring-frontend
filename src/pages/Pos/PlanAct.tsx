import React from "react";
import NoCollection from "@/assets/NoCollection.png";
import NoDataUI from "@/components/ui/NoDataUI";
import { useTranslation } from "react-i18next";

const PlanAct: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <div className="flex flex-col justify-center items-center">
                <NoDataUI
                    title={t("pos.thisSeg")}
                    description={t("pos.youDo")}
                >
                    <img src={NoCollection} className="mx-auto" />
                </NoDataUI>
            </div>
        </div>
    )
}

export default PlanAct;