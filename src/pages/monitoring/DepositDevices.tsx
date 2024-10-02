import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {getDeposit, getDepositPos} from "@/services/api/monitoring";
import {columnsMonitoringFullDevices, columnsMonitoringPos} from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import {useLocation} from "react-router-dom";
import {getPos} from "@/services/api/pos";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";

const DepositDevices: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const [isData, setIsData] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>({dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59`, posId: location.state?.ownerId});

    const {  data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate  } = useSWR([`get-pos-deposits-pos-${dataFilter.posId ? dataFilter.posId : location.state?.ownerId}`], () => getDepositPos(
        dataFilter.posId ? dataFilter.posId : location.state.ownerId, {
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
    }));
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(7))


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
            {isData ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={devicesMonitoring}
                        columns={columnsMonitoringFullDevices}
                        isDisplayEdit={true}
                        nameUrl={'device'}
                    />
                </div>
            ):(
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

export default DepositDevices;