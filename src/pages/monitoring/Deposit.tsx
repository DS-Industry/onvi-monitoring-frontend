import React, {useEffect, useRef, useState} from "react";
import OverflowTable from "../../components/ui/Table/OverflowTable.tsx";
import {columnsDevice, columnsMonitoringPos} from "../../utils/OverFlowTableData.tsx";
import NoDataUI from "../../components/ui/NoDataUI.tsx";
import SalyIamge from "../../assets/Saly-46.svg?react";
import useSWR, {useSWRConfig} from "swr";
import {getDeposit} from "../../services/api/monitoring";
import FilterMonitoring from "../../components/ui/Filter/FilterMonitoring.tsx";
import {getPos} from "../../services/api/pos";

const Deposit: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const [isData, setIsData] = useState(true);

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>({dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59`});

    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
    };

    const { data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate } = useSWR(['get-pos-deposits'], () => getDeposit({
        dateStart: dataFilter?.dateStart,
        dateEnd: dataFilter?.dateEnd,
        posId: dataFilter?.posId,
    }));
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(7))

    useEffect(() => {
        console.log(JSON.stringify(error, null, 2));
    }, [error]);

    useEffect(() => {
        filterMutate();
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
            {isData ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={posMonitoring}
                        columns={columnsMonitoringPos}
                        isDisplayEdit={true}
                        nameUrl={'pos'}
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

export default Deposit;