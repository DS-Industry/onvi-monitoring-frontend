import NoDataUI from "@/components/ui/NoDataUI";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.png"
import useSWR from "swr";
import { getChemicalReport, getPoses } from "@/services/api/equipment";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsChemicalConsumption } from "@/utils/OverFlowTableData";
import { usePosType, useSetPosType, useStartDate, useEndDate, useSetStartDate, useSetEndDate, useCity } from '@/hooks/useAuthStore';
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import DynamicTable from "@/components/ui/Table/DynamicTable";

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
    const allCategoriesText = t("warehouse.all");
    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const city = useCity();

    const dataFilter = useMemo<FilterChemicalPos>(() => ({
        dateStart: new Date(startDate).toISOString().slice(0, 10),
        dateEnd: new Date(endDate).toISOString().slice(0, 10),
        posId: posType,
        placementId: city
    }), [startDate, endDate, posType, city]);


    // Create a stable SWR key that includes all filter parameters
    const chemicalReportKey = posType !== "*" ?
        `chemical-report-${dataFilter.dateStart}-${dataFilter.dateEnd}-${dataFilter.posId}-${dataFilter.placementId}` :
        null;

    const { data: chemicalReports, isLoading: chemicalLoading } = useSWR(
        chemicalReportKey,
        () => getChemicalReport({
            dateStart: dataFilter.dateStart,
            dateEnd: dataFilter.dateEnd,
            posId: dataFilter.posId,
            placementId: dataFilter.placementId
        }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const { data: posData, isLoading: loadingPos, isValidating: validatingPos } = useSWR(
        [`get-pos`, city],
        () => getPoses({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    const handleDataFilter = useCallback((newFilterData: Partial<FilterChemicalPos>) => {
        if (newFilterData.posId !== undefined) {
            setPosType(newFilterData.posId);
        }
        if (newFilterData.dateStart) {
            setStartDate(new Date(newFilterData.dateStart));
        }
        if (newFilterData.dateEnd) {
            setEndDate(new Date(newFilterData.dateEnd));
        }
    }, [setPosType, setStartDate, setEndDate]);


    const data: TechTask[] = chemicalReports || [];
    const tableRows = transformDataToTableRows(data);

    const poses: { name: string; value: number | string; }[] = useMemo(() => {
        const mappedPoses = posData?.map((item) => ({ name: item.name, value: item.id })) || [];
        const posesAllObj = {
            name: allCategoriesText,
            value: "*"
        };
        return [posesAllObj, ...mappedPoses];
    }, [posData, allCategoriesText]);

    return (
        <>
            <FilterMonitoring
                count={tableRows.length}
                posesSelect={poses}
                handleDateFilter={handleDataFilter}
                hideSearch={true}
                loadingPos={loadingPos || validatingPos}
            />
            {chemicalLoading ? (
                <TableSkeleton columnCount={columnsChemicalConsumption.length} />
            ) :
                tableRows.length > 0 ?
                    <div className="mt-8">
                        <DynamicTable
                            data={tableRows.map((row, index) => ({ ...row, id: index }))}
                            columns={columnsChemicalConsumption}
                            isDisplayEdit={true}
                        />
                    </div> :
                    <NoDataUI
                        title={t("chemical.noText")}
                        description={t("chemical.dont")}
                    >
                        <img src={SalyImage} className="mx-auto" loading="lazy" alt="CHEMICAL" />
                    </NoDataUI>
            }
        </>
    )
}

export default ChemicalConsumption;