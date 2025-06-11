import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getProgramPos } from "@/services/api/pos";
import { columnsProgramsPos } from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCity, useSetCity, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageNumber, useSetPageSize } from '@/hooks/useAuthStore';
import { getPoses } from "@/services/api/equipment";
import { useTranslation } from "react-i18next";
import DynamicTable from "@/components/ui/Table/DynamicTable";

type FilterDepositPos = {
    dateStart: Date;
    dateEnd: Date;
    posId: number | string;
    placementId: number | string;
    page?: number;
    size?: number;
}

enum CarWashPosType {
    SelfService = "SelfService",
    Portal = "Portal",
    SelfServiceAndPortal = "SelfServiceAndPortal"
}

type PosPrograms = {
    id: number;
    name: string;
    posType?: CarWashPosType;
    programsInfo:
    {
        programName: string;
        counter: number;
        totalTime: number;
        averageTime: string;
        totalProfit?: number;
        averageProfit?: number;
        lastOper?: Date;
    }[]
}

type PosMonitoring = {
    id: number;
    name: string;
}


const ProgramDevices: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const location = useLocation();
    const [isTableLoading, setIsTableLoading] = useState(false);
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

    const initialFilter = {
        dateStart: startDate || `${formattedDate} 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        posId: posType || location.state?.ownerId,
        placementId: city,
        page: currentPage,
        size: pageSize
    };

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>(initialFilter);

    useEffect(() => {
        setCurrentPage(1);
        setIsDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    const { data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate } = useSWR([`get-pos-programs-pos-${dataFilter.posId ? dataFilter.posId : location.state?.ownerId}`], () => getProgramPos(
        {
            dateStart: dataFilter.dateStart,
            dateEnd: dataFilter.dateEnd,
            posId: dataFilter?.posId,
            placementId: dataFilter?.placementId,
            page: currentPage,
            size: pageSize
        }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const totalRecords = filter?.length || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
            setIsDataFilter((prevFilter) => ({
                ...prevFilter,
                page: maxPages > 0 ? maxPages : 1
            }));
        }
    }, [maxPages, currentPage, setCurrentPage]);

    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if (newFilterData.placementId) setCity(newFilterData.placementId);
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageSize(newFilterData.size);
    };

    useEffect(() => {
    }, [filterErtot]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    useEffect(() => {
        if (!filterLoading && filter?.length)
            setTotalCount(filter?.length)
    }, [filter, filterLoading, setTotalCount]);

    const devicePrograms: PosPrograms[] = filter?.map((item: PosPrograms) => {
        return item;
    }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];

    const posData: PosMonitoring[] = data?.map((item: PosMonitoring) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

    const posOptional: { name: string; value: number | string }[] = posData.map(
        (item) => ({ name: item.name, value: item.id })
    );

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    posOptional.unshift(posesAllObj);

    return (
        <>
            <FilterMonitoring
                count={devicePrograms.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideSearch={true}
            />
            {isTableLoading || filterLoading ? (
                <div className="mt-8 space-y-6">
                    <div>
                        <TableSkeleton columnCount={columnsProgramsPos.length} />
                    </div>
                </div>)
                : devicePrograms.length > 0 ? (
                    <div className="mt-8 space-y-6">
                        {devicePrograms.map((deviceProgram) =>
                            <DynamicTable
                                title={deviceProgram.name}
                                urlTitleId={deviceProgram.id}
                                nameUrlTitle={"/station/programs/devices"}
                                data={deviceProgram.programsInfo.map((p, index) => ({ id: index, ...p }))}
                                columns={columnsProgramsPos}
                                showPagination={true}
                            />
                        )}
                    </div>
                ) : (
                    <>
                        <NoDataUI
                            title={t("pos.this")}
                            description={t("pos.you")}
                        >
                            <SalyIamge className="mx-auto" />
                        </NoDataUI>
                    </>
                )}
        </>
    )
}

export default ProgramDevices;