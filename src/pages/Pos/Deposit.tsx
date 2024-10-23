import React, { useEffect, useRef, useState } from "react";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import { columnsDevice, columnsMonitoringPos } from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import useSWR, { useSWRConfig } from "swr";
import { getDeposit } from "@/services/api/monitoring";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import { getPos } from "@/services/api/pos";
import { useLocation } from "react-router-dom";
import CustomSkeleton from "@/utils/CustomSkeleton";


const Deposit: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const location = useLocation();

    const [isData, setIsData] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>({ dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59` });

    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
    };

    const { data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate } = useSWR(['get-pos-deposits'], () => getDeposit(dataFilter.posId ? dataFilter.posId : location.state.ownerId, {
        dateStart: dataFilter?.dateStart,
        dateEnd: dataFilter?.dateEnd
    }));
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(1))

    useEffect(() => {
        console.log(JSON.stringify(error, null, 2));
    }, [error]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter]);

    const posMonitoring: PosMonitoring[] = filter?.map((item: PosMonitoring) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

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
            />
            { isTableLoading || filterLoading ? (<CustomSkeleton type="table" rowCount={5} columnCount={columnsMonitoringPos.length} />)
                :
                posMonitoring.length > 0 ? (
                    <div className="mt-8">
                        <OverflowTable
                            tableData={posMonitoring}
                            columns={columnsMonitoringPos}
                            isDisplayEdit={true}
                            nameUrl={"/station/enrollments/device"}
                            isLoading={filterLoading}
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