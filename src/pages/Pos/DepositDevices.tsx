import React, { useEffect, useMemo, useCallback } from "react";
import useSWR from "swr";
import { getDepositPos } from "@/services/api/pos";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/PosMonitoringEmpty.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCity, useSetCity, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageNumber, useSetPageSize } from '@/hooks/useAuthStore';
import { getPoses } from "@/services/api/equipment";
import { useTranslation } from "react-i18next";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { getPlacement } from "@/services/api/device";

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

    // Reset page to 1 when location changes
    useEffect(() => {
        setCurrentPage(1);
    }, [location, setCurrentPage]);

    const { data: filter, isLoading: filterLoading } = useSWR(
        swrKey,
        () => getDepositPos(filterParams),
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

    const { data, isLoading, isValidating } = useSWR(
        `get-pos-${city}`,
        () => getPoses({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );

    const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cities: { text: string; value: string; }[] = cityData?.map((item) => ({ text: item.region, value: item.region })) || [];

    useEffect(() => {
        if (!filterLoading && filter?.totalCount) {
            setTotalCount(filter.totalCount);
        }
    }, [filter?.totalCount, filterLoading, setTotalCount]);

    const handleDataFilter = useCallback((newFilterData: Partial<FilterDepositPos>) => {
        if (newFilterData.posId !== undefined) setPosType(newFilterData.posId);
        if (newFilterData.dateStart !== undefined) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd !== undefined) setEndDate(newFilterData.dateEnd);
        if (newFilterData.placementId !== undefined) setCity(newFilterData.placementId);
        if (newFilterData.page !== undefined) setCurrentPage(newFilterData.page);
        if (newFilterData.size !== undefined) setPageSize(newFilterData.size);
    }, [setPosType, setStartDate, setEndDate, setCity, setCurrentPage, setPageSize]);

    const devicesMonitoring: DevicesMonitoring[] = useMemo(() => {
        return filter?.oper?.map((item: DevicesMonitoring) => item)
            .sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];
    }, [filter?.oper]);

    const posData: PosMonitoring[] = useMemo(() => {
        return data?.map((item: PosMonitoring) => item)
            .sort((a, b) => a.id - b.id) || [];
    }, [data]);

    const posOptional = useMemo(() => {
        const options = posData.map(item => ({ name: item.name, value: item.id }));
        const posesAllObj = { name: allCategoriesText, value: "*" };
        return [posesAllObj, ...options];
    }, [posData, allCategoriesText]);

    const poses: { text: string; value: string; }[] = posData.map((pos) => ({ text: pos.name, value: pos.name }));

    const columnsMonitoringPos = [
        {
            label: "id",
            key: "id",
        },
        {
            label: "Наименование",
            key: "name",
            filters: poses
        },
        {
            label: "Город",
            key: "city",
            filters: cities
        },
        {
            label: "Последняя операция",
            key: "lastOper",
            type: "date",
        },
        {
            label: "Наличные",
            key: "cashSum",
            type: "currency"
        },
        {
            label: "Безналичные",
            key: "virtualSum",
            type: "currency"
        },
        {
            label: "Сashback по картам",
            key: "cashbackSumCard",
            type: "currency"
        },
        {
            label: "Сумма скидки",
            key: "discountSum",
            type: "currency"
        },
        {
            label: "Кол-во опреаций",
            key: "counter",
            type: "number"
        },
        {
            label: "Яндекс Сумма",
            key: "yandexSum",
            type: "currency"
        },
    ];

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
                filterLoading ? (
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