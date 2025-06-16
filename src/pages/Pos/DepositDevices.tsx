import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getDepositPos } from "@/services/api/pos";
import { columnsMonitoringPos } from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/PosMonitoringEmpty.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCity, useSetCity, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageNumber, useSetPageSize } from '@/hooks/useAuthStore';
import { getPoses } from "@/services/api/equipment";
import { useTranslation } from "react-i18next";
import DynamicTable from "@/components/ui/Table/DynamicTable";

interface FilterDepositPos {
    dateStart: Date;
    dateEnd: Date;
    posId: number | string;
    placementId: number | string;
    page?: number;
    size?: number;
}

interface DevicesMonitoring {
    id: number;
    name: string;
    city: string;
    counter: number;
    cashSum: number;
    virtualSum: number;
    yandexSum: number;
    mobileSum: number;
    cardSum: number;
    lastOper: Date;
    discountSum: number;
    cashbackSumCard: number;
    cashbackSumMub: number;
}

interface PosMonitoring {
    id: number;
    name: string;
    slug: string;
    address: string;
    organizationId: number;
    placementId: number;
    timezone: number;
    posStatus: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
}

const DepositDevices: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const location = useLocation();

    const posType = usePosType();
    const city = useCity();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setCity = useSetCity();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();

    const setCurrentPage = useSetCurrentPage();
    const setPageSize = useSetPageNumber();
    const setTotalCount = useSetPageSize();

    const [isTableLoading, setIsTableLoading] = useState(false);

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

    const { data: filter, isLoading: filterLoading, mutate: filterMutate } = useSWR(
        [`get-pos-deposits-pos-${dataFilter.posId}`],
        () => getDepositPos({
            dateStart: dataFilter.dateStart,
            dateEnd: dataFilter.dateEnd,
            posId: dataFilter?.posId,
            placementId: dataFilter?.placementId,
            page: currentPage,
            size: pageSize
        }),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

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

    const { data, error, isLoading, isValidating } = useSWR(
        [`get-pos`, city],
        () => getPoses({ placementId: city }),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

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
    }, [error]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    useEffect(() => {
        if (!filterLoading && filter?.length)
            setTotalCount(filter?.length)
    }, [filter, filterLoading, setTotalCount]);

    const devicesMonitoring: DevicesMonitoring[] = filter?.map((item: DevicesMonitoring) => {
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
                count={devicesMonitoring.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideSearch={true}
                loadingPos={isLoading || isValidating}
            />
            {
                isTableLoading || filterLoading ? (
                    <TableSkeleton columnCount={columnsMonitoringPos.length} />
                ) : devicesMonitoring.length > 0 ? (
                    <div className="mt-8">
                        <DynamicTable
                            data={devicesMonitoring}
                            columns={columnsMonitoringPos}
                            isDisplayEdit={true}
                            showPagination={true}
                            navigableFields={[{ key: "name", getPath: () => '/station/enrollments/devices' }]}
                        />
                    </div>
                ) : (
                    <>
                        <NoDataUI
                            title="В этом разделе представлены операции, которые фиксируются купюроприемником"
                            description="У вас пока нет операций с купюроприемником"
                        >
                            <SalyIamge className="mx-auto" />
                        </NoDataUI>
                    </>
                )}
        </>
    );
}

export default DepositDevices;
