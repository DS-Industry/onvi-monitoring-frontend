import React, { useCallback, useEffect, useMemo } from "react";
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
import ExpandableTable from "@/components/ui/Table/ExpandableTable";

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
        `get-pos-deposits-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}`,
        [filterParams]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [location, setCurrentPage]);

    const { data: filter, isLoading: filterLoading } = useSWR(swrKey, () =>
        getProgramPos(filterParams), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data, isLoading, isValidating } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const totalRecords = filter?.totalCount || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
        }
    }, [maxPages, currentPage, setCurrentPage]);

    const handleDataFilter = useCallback((newFilterData: Partial<FilterDepositPos>) => {

        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if (newFilterData.placementId) setCity(newFilterData.placementId);
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageSize(newFilterData.size);
    }, [setCity, setCurrentPage, setEndDate, setPageSize, setPosType, setStartDate]);

    useEffect(() => {
        if (!filterLoading && filter?.totalCount)
            setTotalCount(filter?.totalCount)
    }, [filter, filterLoading, setTotalCount]);

    const devicePrograms: PosPrograms[] = useMemo(() => {
        return filter?.prog?.map((item: PosPrograms) => {
            return item;
        }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || []
    }, [filter?.prog]);

    const posData: PosMonitoring[] = useMemo(() => {
        return data?.map((item: PosMonitoring) => item)
            .sort((a, b) => a.id - b.id) || [];
    }, [data]);

    const posOptional: { name: string; value: number | string }[] = posData.map(
        (item) => ({ name: item.name, value: item.id })
    );

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    posOptional.unshift(posesAllObj);

    const poses: { text: string; value: string; }[] = posData.map((pos) => ({ text: pos.name, value: pos.name }));

    return (
        <>
            <FilterMonitoring
                count={devicePrograms.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideSearch={true}
                loadingPos={isLoading || isValidating}
            />
            {filterLoading ? (
                <div className="mt-8 space-y-6">
                    <div>
                        <TableSkeleton columnCount={columnsProgramsPos.length} />
                    </div>
                </div>)
                : devicePrograms.length > 0 ? (
                    <div className="mt-8 space-y-6">
                        <ExpandableTable
                            data={devicePrograms.flatMap((deviceProgram, deviceIndex) =>
                                deviceProgram.programsInfo ? deviceProgram.programsInfo.map((p, programIndex) => ({
                                    id: `${deviceIndex}-${programIndex}`,
                                    deviceId: deviceProgram.id,
                                    deviceName: deviceProgram.name,
                                    paperTypeType: "",
                                    ...p
                                })).sort((a, b) => a.deviceName.toLowerCase().localeCompare(b.deviceName.toLowerCase())) : []
                            )}
                            columns={columnsProgramsPos}
                            titleColumns={[{
                                label: "Device Name",
                                key: "deviceName",
                                filters: poses
                            }]}
                            titleData={devicePrograms.map(deviceProgram => ({
                                title: deviceProgram.name,
                                deviceName: deviceProgram.name,
                                deviceId: deviceProgram.id
                            })).sort((a, b) => a.deviceName.toLowerCase().localeCompare(b.deviceName.toLowerCase()))}
                            showPagination={true}
                            navigableFields={[{ key: "deviceName", getPath: () => '/station/programs/devices' }]}
                        />
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