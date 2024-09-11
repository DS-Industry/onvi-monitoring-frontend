import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {getDeposit, getPrograms} from "../../services/api/monitoring";
import {columnsMonitoringPos, columnsProgramsPos} from "../../utils/OverFlowTableData.tsx";
import OverflowTable from "../../components/ui/Table/OverflowTable.tsx";
import NoDataUI from "../../components/ui/NoDataUI.tsx";
import FilterMonitoring from "../../components/ui/Filter/FilterMonitoring.tsx";
import {getPos} from "../../services/api/pos";
import SalyIamge from "../../assets/Saly-45.svg?react";

const Programs: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>({dateStart: `01.01.2024 00:00`, dateEnd: `${formattedDate} 23:59`});

    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
    };

    const { data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate } = useSWR(['get-pos-programs'], () => getPrograms({
        dateStart: dataFilter?.dateStart,
        dateEnd: dataFilter?.dateEnd,
        posId: dataFilter?.posId,
    }));
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(7))


    useEffect(() => {
        console.log(JSON.stringify(filterErtot, null, 2));
    }, [filterErtot]);

    useEffect(() => {
        filterMutate();
    }, [dataFilter]);

    const posPrograms: PosPrograms[] = filter?.map((item: PosPrograms) => {
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
                count={posPrograms.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
            />
            {posPrograms.length > 0 ? (
                <div className="mt-8">
                    { posPrograms.map((posProgram) =>
                        <OverflowTable
                            title={posProgram.name}
                            urlTitleId={posProgram.id}
                            nameUrlTitle={'pos'}
                            tableData={posProgram.programsInfo}
                            columns={columnsProgramsPos}
                        />
                    )
                    }
                </div>
            ):(
                <>
                    <NoDataUI
                        title="В этом разделе представленны программы"
                        description="По данной выборке программ не обнаружено"
                    >
                        <SalyIamge className="mx-auto" />
                    </NoDataUI>
                </>
            )}
        </>
    )
}

export default Programs;