import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getDepositPos } from "@/services/api/pos";
import { columnsMonitoringPos } from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/PosMonitoringEmpty.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate } from '@/hooks/useAuthStore';
import { getPoses } from "@/services/api/equipment";

interface FilterDepositPos {
    dateStart: Date;
    dateEnd: Date;
    posId: number;
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
    monthlyPlan: number;
    timeWork: string;
    organizationId: number;
    posMetaData: string;
    timezone: number;
    image: string;
    rating: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
    address:
    {
        id: number;
        city: string;
        location: string;
        lat: number;
        lon: number;
    };
    posType:
    {
        id: number;
        name: string;
        slug: string;
        carWashPosType: string;
        minSumOrder: number;
        maxSumOrder: number;
        stepSumOrder: number;
    };
}

const DepositDevices: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const location = useLocation();

    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();

    const [isTableLoading, setIsTableLoading] = useState(false);
    
    const initialFilter = {
        dateStart: startDate || `${formattedDate} 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        posId: posType || location.state?.ownerId,
    };

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>(initialFilter);

    const { data: filter, isLoading: filterLoading, mutate: filterMutate } = useSWR(
        [`get-pos-deposits-pos-${dataFilter.posId}`], 
        () => getDepositPos({
            dateStart: dataFilter.dateStart,
            dateEnd: dataFilter.dateEnd,
            posId: dataFilter?.posId,
        }), 
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const { data, error } = useSWR(
        [`get-pos`], 
        () => getPoses(), 
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
    };

    useEffect(() => {
        console.log(JSON.stringify(error, null, 2));
    }, [error]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    const devicesMonitoring: DevicesMonitoring[] = filter?.map((item: DevicesMonitoring) => {
        return item;
    }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];

    const posData: PosMonitoring[] = data?.map((item: PosMonitoring) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

    const posOptional: { name: string; value: string }[] = posData.map(
        (item) => ({ name: item.name, value: item.id.toString() })
    );

    return (
        <>
            <FilterMonitoring
                count={devicesMonitoring.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
            />
            {
                isTableLoading || filterLoading ? (
                    <TableSkeleton columnCount={columnsMonitoringPos.length} />
                ) : devicesMonitoring.length > 0 ? (
                    <div className="mt-8">
                        <OverflowTable
                            tableData={devicesMonitoring}
                            columns={columnsMonitoringPos}
                            isDisplayEdit={true}
                            nameUrl={"/station/enrollments/devices"}
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
