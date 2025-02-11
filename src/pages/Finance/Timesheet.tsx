import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NoTimeSheet from "@/assets/NoTimesheet.png";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate } from "@/hooks/useAuthStore";
import { getPoses } from "@/services/api/equipment";
import useSWR from "swr";
import { useButtonCreate } from "@/components/context/useContext";
import { useNavigate } from "react-router-dom";

interface FilterCollection {
    dateStart: string;
    dateEnd: string;
    posId: number;
}

const Timesheet: React.FC = () => {
    const { t } = useTranslation();
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();
    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();

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


    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    useEffect(() => {
        if (buttonOn)
            navigate("/finance/timesheet/creation");
    }, [buttonOn, navigate]);

    return (
        <div>
            <FilterMonitoring
                count={0}
                posesSelect={poses}
                usersSelect={[]}
                hideSearch={true}
                handleDataFilter={handleDataFilter}
            />
            <div className="flex flex-col justify-center items-center">
                <NoDataUI
                    title={t("finance.data")}
                    description={t("finance.atThe")}
                >
                    <img src={NoTimeSheet} className="mx-auto" />
                </NoDataUI>
            </div>
        </div>
    )
}

export default Timesheet;