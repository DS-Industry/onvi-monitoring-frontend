import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import NoCollection from "@/assets/NoCollection.png";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import useSWR from "swr";
import { getPoses } from "@/services/api/equipment";
import { useButtonCreate } from "@/components/context/useContext";
import { useNavigate } from "react-router-dom";

const Collection: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    useEffect(() => {
        if(buttonOn)
            navigate("/finance/collection/creation");
    }, [buttonOn, navigate]);

    return (
        <div>
            <FilterMonitoring
                count={0}
                // posesSelect={poses}
                hideSearch={true}
            />
            <div className="flex flex-col justify-center items-center">
                <NoDataUI
                    title={t("finance.details")}
                    description={t("finance.at")}
                >
                    <img src={NoCollection} className="mx-auto" />
                </NoDataUI>
            </div>
        </div>
    )
}

export default Collection;