import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.png"
import useSWR from "swr";
import { getChemicalReport, getPoses } from "@/services/api/equipment";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsChemicalConsumption } from "@/utils/OverFlowTableData";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { usePosType, useSetPosType, useStartDate, useEndDate, useSetStartDate, useSetEndDate, useCity } from '@/hooks/useAuthStore';
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";

interface TechRateInfo {
    code: string;
    spent: string;
    time: string;
    recalculation: string;
    service: string;
}

interface TechTask {
    techTaskId: number;
    period: string;
    techRateInfos: TechRateInfo[];
}

interface TableRow {
    period: string;
    [key: string]: string; // For dynamic keys (spent, time, recalculation for each chemical)
}

interface FilterChemicalPos {
    dateStart: string;
    dateEnd: string;
    posId: number | string;
    placementId: number | string;
}

const transformDataToTableRows = (data: TechTask[]): TableRow[] => {
    return data.map((task) => {
        const row: TableRow = { period: task.period };

        // Map each techRateInfo to the appropriate column based on the `code`
        task.techRateInfos.forEach((info) => {
            const prefixMap: { [key: string]: string } = {
                SOAP: "Вода + шампунь",
                PRESOAK: "Активная химия",
                TIRE: "Мойка дисков",
                BRUSH: "Щетка + пена",
                WAX: "Воск + защита",
                TPOWER: "T-POWER",
            };

            const prefix = prefixMap[info.code];
            if (prefix) {
                row[`${prefix}, факт`] = info.spent;
                row[`${prefix}, время`] = info.time;
                row[`${prefix}, пересчет`] = info.recalculation;
            }
        });

        return row;
    });
};

const ChemicalConsumption: React.FC = () => {
    const { t } = useTranslation();
    const [isTableLoading, setIsTableLoading] = useState(false);
    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const city = useCity();

    const initialFilter = {
        dateStart: startDate.toString().slice(0, 10),
        dateEnd: endDate.toString().slice(0, 10),
        posId: posType,
        placementId: city
    };

    const [dataFilter, setIsDataFilter] = useState<FilterChemicalPos>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<FilterChemicalPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
    };

    const { data: chemicalReports, isLoading: chemicalLoading, mutate: chemicalMutate } = useSWR(posType !== "*" ? [`get-chemical-consumption`] : null, () => getChemicalReport({
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
        posId: posType, 
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    useEffect(() => {
        chemicalMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, chemicalMutate]);

    const data: TechTask[] = chemicalReports || [];
    const tableRows = transformDataToTableRows(data);
    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    console.log(tableRows);

    return (
        <>
            <FilterMonitoring
                count={tableRows.length}
                posesSelect={poses}
                handleDataFilter={handleDataFilter}
            />
            {isTableLoading || chemicalLoading ? (
                <TableSkeleton columnCount={columnsChemicalConsumption.length} />
            ) :
                tableRows.length > 0 ?
                    <div className="mt-8">
                        <OverflowTable
                            tableData={tableRows}
                            columns={columnsChemicalConsumption}
                            isDisplayEdit={true}
                        />
                    </div> :
                    <NoDataUI
                        title={t("chemical.noText")}
                        description={t("chemical.dont")}
                    >
                        <img src={SalyImage} className="mx-auto" />
                    </NoDataUI>
            }
        </>
    )
}

export default ChemicalConsumption;