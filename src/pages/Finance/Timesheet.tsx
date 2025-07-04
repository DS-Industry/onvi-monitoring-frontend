import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import NoTimeSheet from "@/assets/NoTimesheet.png";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageSize, useCity, useSetPageNumber } from "@/hooks/useAuthStore";
import { getPoses, getWorkers } from "@/services/api/equipment";
import useSWR from "swr";
import { useButtonCreate } from "@/components/context/useContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getShifts } from "@/services/api/finance";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsShifts } from "@/utils/OverFlowTableData";
import DynamicTable from "@/components/ui/Table/DynamicTable";

interface FilterCollection {
    dateStart: string;
    dateEnd: string;
    posId: number | string;
    page?: number;
    size?: number;
}

const Timesheet: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();

    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();
    const location = useLocation();
    const city = useCity();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setCurrentPage = useSetCurrentPage();
    const setTotalCount = useSetPageSize();
    const setPageSize = useSetPageNumber();

    // Create stable initial filter
    const filterParams = useMemo(() => ({
        dateStart: startDate,
        dateEnd: endDate,
        page: currentPage,
        size: pageSize,
        posId: posType || 1,
        placementId: city
    }), [startDate, endDate, currentPage, pageSize, posType, city]);

    // Reset page when location changes
    useEffect(() => {
        setCurrentPage(1);
    }, [location, setCurrentPage]);

    // Create stable SWR key
    const swrKey = useMemo(() =>
        `get-shifts-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}`,
        [filterParams]
    );

    const { data: filter, isLoading: filterIsLoading } = useSWR(
        swrKey,
        () => getShifts(filterParams),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    const totalRecords = filter?.totalCount || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (totalRecords > 0 && currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
        }
    }, [maxPages, currentPage, setCurrentPage, totalRecords]);

    const handleDataFilter = useCallback((newFilterData: Partial<FilterCollection>) => {
        if (newFilterData.posId !== undefined) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
        if (newFilterData.page !== undefined) setCurrentPage(newFilterData.page);
        if (newFilterData.size !== undefined) setPageSize(newFilterData.size);

    }, [setPosType, setStartDate, setEndDate, setCurrentPage, setPageSize]);

    // Update total count when data changes
    useEffect(() => {
        if (!filterIsLoading && filter?.totalCount) {
            setTotalCount(filter.totalCount);
        }
    }, [filter?.totalCount, filterIsLoading, setTotalCount]);

    const { data: posData, isLoading, isValidating } = useSWR(
        [`get-pos`, city],
        () => getPoses({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    const { data: workerData } = useSWR(
        [`get-worker`],
        () => getWorkers(),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    const poses: { name: string; value: number | string; }[] = useMemo(() => {
        const mappedPoses = posData?.map((item) => ({ name: item.name, value: item.id })) || [];
        const posesAllObj = {
            name: allCategoriesText,
            value: "*"
        };
        return [posesAllObj, ...mappedPoses];
    }, [posData, allCategoriesText]);

    const workers: { name: string; value: number; }[] = useMemo(() => {
        return workerData?.map((item) => ({ name: item.name, value: item.id })) || [];
    }, [workerData]);

    useEffect(() => {
        if (buttonOn) {
            navigate("/finance/timesheet/creation", { state: { ownerId: 0 } });
        }
    }, [buttonOn, navigate]);

    const shifts = useMemo(() => {
        return filter?.shiftReportsData.map((item) => ({
            ...item,
            posName: poses.find((pos) => pos.value === item.posId)?.name || "-",
            createdByName: workers.find((work) => work.value === item.createdById)?.name || "-"
        })) || [];
    }, [filter?.shiftReportsData, poses, workers]);

    return (
        <div>
            <FilterMonitoring
                count={shifts.length}
                posesSelect={poses}
                hideSearch={true}
                handleDataFilter={handleDataFilter}
                loadingPos={isLoading || isValidating}
            />
            {filterIsLoading ? (
                <TableSkeleton columnCount={columnsShifts.length} />
            ) : (
                shifts.length > 0 ? (
                    <div className="mt-8">
                        <DynamicTable
                            data={shifts}
                            columns={columnsShifts}
                            isDisplayEdit={true}
                            showPagination={true}
                            navigableFields={[{ key: "posName", getPath: () => "/finance/timesheet/creation" }]}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <NoDataUI
                            title={t("finance.data")}
                            description={t("finance.atThe")}
                        >
                            <img src={NoTimeSheet} className="mx-auto" loading="lazy" alt="No Timesheet" />
                        </NoDataUI>
                    </div>
                )
            )}
        </div>
    );
};

export default Timesheet;