import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {getDeposit, getDepositPos} from "@/services/api/monitoring";
import {columnsMonitoringFullDevices, columnsMonitoringPos} from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import {useLocation} from "react-router-dom";
import {getPos} from "@/services/api/pos";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/PosMonitoringEmpty.svg?react";


const DepositDevices: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const [isData, setIsData] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>({dateStart: `2024-10-01 00:00`, dateEnd: `${formattedDate} 23:59`, posId: location.state?.ownerId});

    const {  data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate  } = useSWR([`get-pos-deposits-pos-${dataFilter.posId ? dataFilter.posId : location.state?.ownerId}`], () => getDepositPos({
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
        posId: dataFilter?.posId
    }),{ revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(1),{ revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })


    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
    };

    useEffect(() => {
        console.log(JSON.stringify(error, null, 2));
    }, [error]);

    useEffect(() => {
        filterMutate();
    }, [dataFilter]);

    const devicesMonitoring: DevicesMonitoring[] = filter?.map((item: DevicesMonitoring) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

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
            />
            {devicesMonitoring.length !== 0 ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={devicesMonitoring}
                        columns={columnsMonitoringPos}
                        isDisplayEdit={true}
                        nameUrl={"/station/enrollments/devices"}
                    />
                </div>
            ):(
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
    )
}

export default DepositDevices;