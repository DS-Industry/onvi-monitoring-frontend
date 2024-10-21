import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {getDeposit, getProgramPos, getPrograms} from "@/services/api/monitoring";
import {columnsMonitoringPos, columnsProgramsPos} from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import {useLocation} from "react-router-dom";
import {getPos} from "@/services/api/pos";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";


const ProgramDevices: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const location = useLocation();
    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>({dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59`, posId: location.state?.ownerId});


    const { data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate } = useSWR([`get-pos-programs-pos-${dataFilter.posId ? dataFilter.posId : location.state?.ownerId}`], () => getProgramPos(
        {
            dateStart: dataFilter.dateStart,
            dateEnd: dataFilter.dateEnd,
            posId: dataFilter?.posId
    }),{ revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(1),{ revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })


    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
    };

    useEffect(() => {
        console.log(JSON.stringify(filterErtot, null, 2));
    }, [filterErtot]);
    useEffect(() => {
        filterMutate();
    }, [dataFilter]);

    const devicePrograms: PosPrograms[] = filter?.map((item: PosPrograms) => {
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
                count={devicePrograms.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
            />
            {devicePrograms.length > 0 ? (
                <div className="mt-8">
                    { devicePrograms.map((deviceProgram) =>
                        <OverflowTable
                            title={deviceProgram.name}
                            urlTitleId={deviceProgram.id}
                            nameUrlTitle={"/station/programs/devices"}
                            tableData={deviceProgram.programsInfo}
                            columns={columnsProgramsPos}
                        />
                    )
                    }
                </div>
            ):(
                <>
                    <NoDataUI
                        title="В этом разделе представленны программы"
                        description="У вас пока нету программ"
                    >
                        <SalyIamge className="mx-auto" />
                    </NoDataUI>
                </>
            )}
        </>
    )
}

export default ProgramDevices;