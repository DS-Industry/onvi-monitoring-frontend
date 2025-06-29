import React, { useEffect, useState } from "react";
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
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (location.state?.ownerId) {
            setPosType(location.state.ownerId);
            setIsReady(true);
        }
    }, [location.state?.ownerId, setPosType]);

    const [isTableLoading, setIsTableLoading] = useState(false);
    const initialFilter = {
        dateStart: startDate,
        dateEnd: endDate,
        posId: posType,
    };

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
    };

    const { data: filter, isLoading: filterLoading, mutate: filterMutate } = useSWR(
        isReady ? ['get-pos-deposits'] : null, () => getDeposit(posType, {
        dateStart: dataFilter?.dateStart,
        dateEnd: dataFilter?.dateEnd
    }));

    const city = useCity();

    const { data, error, isLoading, isValidating } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }))

    useEffect(() => {
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

    const posOptional: { name: string; value: number }[] = [
        ...posData.map((item) => ({ name: item.name, value: item.id }))
    ];

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
            {isTableLoading || filterLoading ? (<TableSkeleton columnCount={columnsMonitoringPos.length} />)
                :
                posMonitoring.length > 0 ? (
                    <div className="mt-8">
                        <DynamicTable
                            data={posMonitoring}
                            columns={columnsMonitoringPos}
                            isDisplayEdit={true}
                            navigableFields={[{ key: "name", getPath: () => '/station/enrollments/device' }]}
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