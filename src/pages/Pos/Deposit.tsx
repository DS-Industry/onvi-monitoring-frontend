import React, { useEffect, useState } from "react";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import { columnsMonitoringPos } from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import useSWR from "swr";
import { getDeposit } from "@/services/api/pos";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import { useLocation } from "react-router-dom";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { usePosType, useSetPosType, useStartDate, useEndDate, useSetStartDate, useSetEndDate, useCity } from '@/hooks/useAuthStore'; 
import { getPoses } from "@/services/api/equipment";

interface FilterDepositPos {
    dateStart: Date;
    dateEnd: Date;
    posId: number;
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
        dateStart: startDate || `2024-10-01 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        posId: posType || location.state?.ownerId,
    };

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if(newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
    };

    const { data: filter, isLoading: filterLoading, mutate: filterMutate } = useSWR(['get-pos-deposits'], () => getDeposit(dataFilter.posId ? dataFilter.posId : location.state.ownerId, {
        dateStart: dataFilter?.dateStart,
        dateEnd: dataFilter?.dateEnd
    }));

    const city = useCity();

    const { data, error } = useSWR([`get-pos`], () => getPoses({ placementId: city }))

    useEffect(() => {
        console.log(JSON.stringify(error, null, 2));
    }, [error]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    const posMonitoring: DepositMonitoring[] = filter?.map((item: DepositMonitoring) => {
        return item;
    }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];

    const posData: PosMonitoring[] = data?.map((item: PosMonitoring) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

    const posOptional: { name: string; value: string }[] = [
        { name: 'Все объекты', value: '0' },
        ...posData.map((item) => ({ name: item.name, value: item.id.toString() }))
    ];

    return (
        <>
            <FilterMonitoring
                count={posMonitoring.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
            />
            { isTableLoading || filterLoading ? (<TableSkeleton columnCount={columnsMonitoringPos.length} />)
                :
                posMonitoring.length > 0 ? (
                    <div className="mt-8">
                        <OverflowTable
                            tableData={posMonitoring}
                            columns={columnsMonitoringPos}
                            isDisplayEdit={true}
                            nameUrl={"/station/enrollments/device"}
                        />
                    </div>
                ) : (
                    <>
                        <NoDataUI
                            title="В этом разделе представленны операции"
                            description="У вас пока нету операций"
                        >
                            <SalyIamge className="mx-auto" />
                        </NoDataUI>
                    </>
                )}
        </>
    )
}

export default Deposit;