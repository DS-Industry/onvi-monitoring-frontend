import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getProgramPos } from "@/services/api/pos";
import { columnsProgramsPos } from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { usePosType, useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate } from '@/hooks/useAuthStore';
import { getPoses } from "@/services/api/equipment";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

// Register Chart.js Components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FilterDepositPos {
    dateStart: Date;
    dateEnd: Date;
    posId: number;
}

interface PosPrograms {
    id: number;
    name: string;
    programsInfo:
    {
        programName: string;
        counter: number;
        totalTime: number;
        averageTime: string;
        lastOper: Date;
    }[]
}

interface PosMonitoring {
    id: number;
    name: string;
}


const ProgramDevices: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const location = useLocation();
    const [isTableLoading, setIsTableLoading] = useState(false);
    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();

    const initialFilter = {
        dateStart: startDate || `${formattedDate} 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        posId: posType || location.state?.ownerId,
    };

    const [dataFilter, setIsDataFilter] = useState<FilterDepositPos>(initialFilter);


    const { data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate } = useSWR([`get-pos-programs-pos-${dataFilter.posId ? dataFilter.posId : location.state?.ownerId}`], () => getProgramPos(
        {
            dateStart: dataFilter.dateStart,
            dateEnd: dataFilter.dateEnd,
            posId: dataFilter?.posId
        }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });
    const { data } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })


    const handleDataFilter = (newFilterData: Partial<FilterDepositPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
    };

    useEffect(() => {
        console.log(JSON.stringify(filterErtot, null, 2));
    }, [filterErtot]);
    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    const devicePrograms: PosPrograms[] = filter?.map((item: PosPrograms) => {
        return item;
    }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];

    const posData: PosMonitoring[] = data?.map((item: PosMonitoring) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

    const posOptional: { name: string; value: string }[] = posData.map(
        (item) => ({ name: item.name, value: item.id.toString() })
    );

    const getRandomColor = (index: number) => {
        const colors = [
            "#FF5733", "#33FF57", "#3357FF", "#F39C12", "#8E44AD",
            "#1ABC9C", "#D35400", "#7F8C8D", "#27AE60", "#C0392B"
        ];
        return colors[index % colors.length]; // Cycle through colors if needed
    };

    return (
        <>
            <FilterMonitoring
                count={devicePrograms.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
            />
            {
                isTableLoading || filterLoading ? (<TableSkeleton columnCount={columnsProgramsPos.length} />)
                    :
                    devicePrograms.length > 0 ? (
                        <div className="mt-8 space-y-6">
                            <div className="flex space-x-2">
                                <div className="w-[561px] h-80 shadow-card rounded-2xl p-4">
                                    <Bar
                                        data={{
                                            labels: devicePrograms.flatMap(program =>
                                                program.programsInfo.flatMap(info => [info.programName, ""]) // Adding empty labels as gaps
                                            ),
                                            datasets: [
                                                {
                                                    label: "Кол-во авто",
                                                    data: devicePrograms.flatMap(program =>
                                                        program.programsInfo.flatMap(info => [info.counter, NaN]) // NaN creates the gap
                                                    ),
                                                    backgroundColor: devicePrograms.flatMap(program =>
                                                        program.programsInfo.flatMap((_info, index) => [getRandomColor(index), "rgba(0,0,0,0)"]) // Unique color + transparent gap
                                                    ),
                                                },
                                            ],
                                        }}
                                        options={{
                                            indexAxis: "y" as const,
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                title: {
                                                    display: true,
                                                    text: "Программы",
                                                    font: { size: 16 },
                                                }
                                            },
                                            scales: {
                                                x: { beginAtZero: true },
                                                y: { ticks: { font: { size: 12 } } },
                                            },
                                        }}
                                    />
                                    <div className="flex items-center justify-center ml-20 text-text01">Кол-во авто</div>
                                </div>
                                <div className="w-[561px] h-80 shadow-card rounded-2xl p-4">
                                    <Bar
                                        data={{
                                            labels: devicePrograms.flatMap(program =>
                                                program.programsInfo.map(info => info.programName) // No empty labels
                                            ),
                                            datasets: [
                                                {
                                                    label: "Кол-во авто",
                                                    data: devicePrograms.flatMap(program =>
                                                        program.programsInfo.map(info => info.totalTime) // No NaN values
                                                    ),
                                                    backgroundColor: devicePrograms.flatMap(program =>
                                                        program.programsInfo.map((_info, index) => getRandomColor(index))
                                                    ),
                                                },
                                            ],
                                        }}
                                        options={{
                                            indexAxis: "x" as const,
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                title: {
                                                    display: true,
                                                    text: "Выручка по программам",
                                                    font: { size: 16 },
                                                }
                                            },
                                            scales: {
                                                y: { beginAtZero: true },
                                                x: {
                                                    ticks: {
                                                        autoSkip: false,
                                                        font: { size: 12 },
                                                        maxRotation: 90,
                                                        minRotation: 90,
                                                        color: function (context) {
                                                            return getRandomColor(context.index);
                                                        }
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="shadow-card rounded-2xl p-4 space-y-6">
                                <div className="text-text01 font-semibold text-2xl">Отчет по выручке</div>
                                {devicePrograms.map((deviceProgram) =>
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
                        </div>
                    ) : (
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