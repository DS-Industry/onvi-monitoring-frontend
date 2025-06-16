import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NoTimeSheet from "@/assets/NoTimesheet.png";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageSize, useCity } from "@/hooks/useAuthStore";
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
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();

    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();
    const location = useLocation();

    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setCurrentPage = useSetCurrentPage();
    const setTotalCount = useSetPageSize();
    const [isTableLoading, setIsTableLoading] = useState(false);


    const initialFilter = {
        dateStart: startDate.toString().slice(0, 10) || "2024-01-01",
        dateEnd: endDate.toString().slice(0, 10) || `${formattedDate}`,
        page: currentPage,
        size: pageSize,
        posId: posType || 1,
    };

    useEffect(() => {
        setCurrentPage(1);
        setIsDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    const [dataFilter, setIsDataFilter] = useState<FilterCollection>(initialFilter);

    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate } = useSWR([`get-shifts`], () => getShifts({
        dateStart: new Date(dataFilter.dateStart),
        dateEnd: new Date(dataFilter.dateEnd),
        posId: dataFilter.posId,
        placementId: city,
        page: dataFilter.page,
        size: dataFilter.size
    }));

    const handleDataFilter = (newFilterData: Partial<FilterCollection>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
    };

    useEffect(() => {
    }, [filterError]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    useEffect(() => {
        if (!filterIsLoading && filter?.totalCount)
            setTotalCount(filter?.totalCount)
    }, [filter?.totalCount, filterIsLoading, setTotalCount]);

    const city = useCity();

    const { data: posData, isLoading, isValidating } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number | string; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    poses.unshift(posesAllObj);

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    useEffect(() => {
        if (buttonOn)
            navigate("/finance/timesheet/creation", { state: { ownerId: 0 } });
    }, [buttonOn, navigate]);

    const shifts = filter?.shiftReportsData.map((item) => ({
        ...item,
        posName: poses.find((pos) => pos.value === item.posId)?.name || "-",
        createdByName: workers.find((work) => work.value === item.createdById)?.name || "-"
    })) || [];

    return (
        <div>
            <FilterMonitoring
                count={shifts.length}
                posesSelect={poses}
                hideSearch={true}
                handleDataFilter={handleDataFilter}
                loadingPos={isLoading || isValidating}
            />
            {isTableLoading || filterIsLoading ? (<TableSkeleton columnCount={columnsShifts.length} />)
                :
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
                )}
        </div>
    )
}

export default Timesheet;