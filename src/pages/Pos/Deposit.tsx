import React, { useEffect, useCallback, useMemo } from "react";
import { columnsMonitoringPos } from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import SalyIamge from "@/assets/NoCollection.png";
import useSWR from "swr";
import { getDeposit } from "@/services/api/pos";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import { useLocation } from "react-router-dom";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { usePosType, useSetPosType, useStartDate, useEndDate, useSetStartDate, useSetEndDate, useCity } from '@/hooks/useAuthStore';
import { getPoses } from "@/services/api/equipment";
import DynamicTable from "@/components/ui/Table/DynamicTable";

interface FilterDepositPos {
    dateStart: Date;
    dateEnd: Date;
    posId: number | string;
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

interface DepositMonitoring {
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

const Deposit: React.FC = () => {
    const location = useLocation();

    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const city = useCity();

    // Initialize posType from location state only once
    useEffect(() => {
        if (location.state?.ownerId && posType === "*") {
            setPosType(location.state.ownerId);
        }
    }, [location.state?.ownerId, setPosType, posType]);

    // Memoize the filter parameters to prevent unnecessary re-renders
    const filterParams = useMemo(() => ({
        dateStart: startDate,
        dateEnd: endDate,
        posId: posType,
    }), [startDate, endDate, posType]);

    // Create a stable key for SWR that changes only when filter params change
    const swrKey = useMemo(() => {
        if (posType === "*") return null;
        return [
            'get-pos-deposits',
            posType,
            filterParams.dateStart,
            filterParams.dateEnd
        ];
    }, [posType, filterParams]);

    // Single SWR call with stable key for deposit data
    const { data: filter, isLoading: filterLoading } = useSWR(
        swrKey,
        () => getDeposit(posType, {
            dateStart: filterParams.dateStart,
            dateEnd: filterParams.dateEnd
        }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // SWR call for pos data
    const { data, isLoading, isValidating } = useSWR(
        [`get-pos`, city],
        () => getPoses({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // Optimized filter handler
    const handleDataFilter = useCallback((newFilterData: Partial<FilterDepositPos>) => {
        // Update store values
        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
    }, [setPosType, setStartDate, setEndDate]);

    // Memoize processed data to prevent unnecessary recalculations
    const posMonitoring: DepositMonitoring[] = useMemo(() => {
        return filter?.map((item: DepositMonitoring) => item)
            .sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];
    }, [filter]);

    const posData: PosMonitoring[] = useMemo(() => {
        return data?.map((item: PosMonitoring) => item)
            .sort((a, b) => a.id - b.id) || [];
    }, [data]);

    const posOptional: { name: string; value: number }[] = useMemo(() => {
        return posData.map((item) => ({ name: item.name, value: item.id }));
    }, [posData]);

    return (
        <>
            <FilterMonitoring
                count={posMonitoring.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
                hideReset={true}
                loadingPos={isLoading || isValidating}
            />
            {filterLoading ? (
                <TableSkeleton columnCount={columnsMonitoringPos.length} />
            ) : posMonitoring.length > 0 ? (
                <div className="mt-8">
                    <DynamicTable
                        data={posMonitoring}
                        columns={columnsMonitoringPos}
                        isDisplayEdit={true}
                        navigableFields={[{ key: "name", getPath: () => '/station/enrollments/device' }]}
                    />
                </div>
            ) : (
                <NoDataUI
                    title="В этом разделе представленны операции"
                    description="У вас пока нету операций"
                >
                    <img src={SalyIamge} alt="No" className="mx-auto" />
                </NoDataUI>
            )}
        </>
    )
}

export default Deposit;