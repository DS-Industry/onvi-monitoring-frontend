import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import NoCollection from "@/assets/NoCollection.png";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import useSWR from "swr";
import { getPoses } from "@/services/api/equipment";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCity } from "@/hooks/useAuthStore";

interface FilterCollection {
    dateStart: string;
    dateEnd: string;
    posId: number | string;
}

const Period: React.FC = () => {
    const { t } = useTranslation();
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const city = useCity();

    const initialFilter = {
        dateStart: startDate.toString().slice(0, 10) || "2024-01-01",
        dateEnd: endDate.toString().slice(0, 10) || `${formattedDate}`,
        posId: posType || 1,
    };

    const [dataFilter, setIsDataFilter] = useState<FilterCollection>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<FilterCollection>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
    };


    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    return (
        <div>
            <FilterMonitoring
                count={0}
                posesSelect={poses}
                hideSearch={true}
                handleDataFilter={handleDataFilter}
            />
            <div className="flex flex-col justify-center items-center">
                <NoDataUI
                    title={t("finance.colle")}
                    description={t("finance.atMom")}
                >
                    <img src={NoCollection} className="mx-auto" loading="lazy" alt="Period" />
                </NoDataUI>
            </div>
        </div>
    )
}

export default Period;