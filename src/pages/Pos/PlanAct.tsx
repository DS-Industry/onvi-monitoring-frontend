import React, { useCallback, useEffect, useMemo } from "react";
import NoCollection from "@/assets/NoCollection.png";
import NoDataUI from "@/components/ui/NoDataUI";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { usePosType, useStartDate, useEndDate, useCity, useSetPosType, useSetStartDate, useSetEndDate, useSetCity, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageNumber, useSetPageSize } from "@/hooks/useAuthStore";
import useSWR from "swr";
import { getPlanFact } from "@/services/api/pos";
import { getPoses } from "@/services/api/equipment";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsPlanFact } from "@/utils/OverFlowTableData";
import DynamicTable from "@/components/ui/Table/DynamicTable";

type PlanFactParams = {
    dateStart: Date;
    dateEnd: Date;
    posId: number | string;
    placementId: number | string;
    page?: number;
    size?: number;
}

type PlanFactResponse = {
    posId: number;
    plan: number;
    cashFact: number;
    virtualSumFact: number;
    yandexSumFact: number;
    sumFact: number;
    completedPercent: number;
    notCompletedPercent: number;
}

const PlanAct: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const location = useLocation();
    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const city = useCity();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setCity = useSetCity();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();

    const setCurrentPage = useSetCurrentPage();
    const setPageSize = useSetPageNumber();
    const setTotalCount = useSetPageSize();

    const filterParams = useMemo(() => ({
        dateStart: startDate || `${formattedDate} 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        posId: posType || location.state?.ownerId || "*",
        placementId: city,
        page: currentPage,
        size: pageSize
    }), [startDate, endDate, posType, city, currentPage, pageSize, formattedDate, location.state?.ownerId]);

    const swrKey = useMemo(() =>
        `get-plan-fact-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}`,
        [filterParams]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [location, setCurrentPage]);

    const { data: filter, isLoading: filterLoading } = useSWR(swrKey, () => getPlanFact(
        filterParams), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data, isLoading, isValidating } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const totalRecords = filter?.totalCount || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
        }
    }, [maxPages, currentPage, setCurrentPage]);

    const handleDataFilter = useCallback((newFilterData: Partial<PlanFactParams>) => {
        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if (newFilterData.placementId) setCity(newFilterData.placementId);
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageSize(newFilterData.size);
    },[setCity, setCurrentPage, setEndDate, setPageSize, setPosType, setStartDate]);

    useEffect(() => {
        if (!filterLoading && filter?.totalCount)
            setTotalCount(filter?.totalCount)
    }, [filter, filterLoading, setTotalCount]);

    const posOptional: { name: string; value: number | string; }[] = useMemo(() => {
        return data?.map(
            (item) => ({ name: item.name, value: item.id })
        ) || []
    }, [data]);

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    posOptional.unshift(posesAllObj);

    const planFacts: PlanFactResponse[] = useMemo(() => {
        return filter?.plan.map((item: PlanFactResponse) => ({
            ...item,
            posName: posOptional.find((pos) => pos.value === item.posId)?.name
        })) || []
    }, [filter?.plan, posOptional]);


    return (
        <div>
            <FilterMonitoring
                count={planFacts.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideSearch={true}
                loadingPos={isLoading || isValidating}
            />
            {filterLoading ? (
                <div className="mt-8 space-y-6">
                    <div>
                        <TableSkeleton columnCount={columnsPlanFact.length} />
                    </div>
                </div>)
                : planFacts.length > 0 ? (
                    <div className="mt-8 space-y-6">
                        <DynamicTable
                            data={planFacts.map((p, index) => ({ id: index, ...p }))}
                            columns={columnsPlanFact}
                            showPagination={true}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <NoDataUI
                            title={t("pos.thisSeg")}
                            description={t("pos.youDo")}
                        >
                            <img src={NoCollection} className="mx-auto" loading="lazy" alt="Plan Act" />
                        </NoDataUI>
                    </div>
                )}
        </div>
    )
}

export default PlanAct;