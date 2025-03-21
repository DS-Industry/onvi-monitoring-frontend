import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import NoCollection from "@/assets/NoCollection.png";
import Filter from "@/components/ui/Filter/Filter";
import { useNavigate } from "react-router-dom";
import { useButtonCreate } from "@/components/context/useContext";

const SalaryCalculation: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { buttonOn } = useButtonCreate();

    useEffect(() => {
        if (buttonOn)
            navigate("/hr/salary/creation");
    }, [buttonOn, navigate])

    return (
        <div>
            <Filter count={0} children={undefined}>

            </Filter>
            <div className="flex flex-col justify-center items-center">
                <NoDataUI
                    title={t("hr.here")}
                    description={t("hr.you")}
                >
                    <img src={NoCollection} className="mx-auto" />
                </NoDataUI>
            </div>
        </div>
    )
}

export default SalaryCalculation;