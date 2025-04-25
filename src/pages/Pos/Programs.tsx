import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getPrograms } from "@/services/api/pos";
import { columnsProgramsPos, columnsProgramsPosPortal } from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import { useLocation } from "react-router-dom";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useStartDate, useEndDate, useSetPosType, useSetStartDate, useSetEndDate, useCity, usePosType } from '@/hooks/useAuthStore';
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
import { useTranslation } from "react-i18next";
import CardSkeleton from "@/components/ui/Card/CardSkeleton";
import DynamicTable from "@/components/ui/Table/DynamicTable";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FilterDepositPos {
    dateStart: Date;
    dateEnd: Date;
    posId: number | string;
}

enum CarWashPosType {
    SelfService = "SelfService",
    Portal = "Portal",
    SelfServiceAndPortal = "SelfServiceAndPortal"
}

interface PosPrograms {
    id: number;
    name: string;
    posType?: CarWashPosType;
    programsInfo:
    {
        programName: string;
        counter: number;
        totalTime: number;
        averageTime: string;
        totalProfit?: number;
        averageProfit?: number;
        lastOper?: Date;
    }[]
}

interface PosMonitoring {
    id: number;
    name: string;
}

const Programs: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const location = useLocation();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const posType = usePosType();
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

    const { data: filter, error: filterErtot, isLoading: filterLoading, mutate: filterMutate } = useSWR(
        isReady ? ['get-pos-programs'] : null, 
        () => getPrograms(posType, {
            dateStart: dataFilter?.dateStart,
            dateEnd: dataFilter?.dateEnd,
        }),
        { revalidateOnFocus: false } 
    );

    const city = useCity();

    const { data } = useSWR([`get-pos`], () => getPoses({ placementId: city }))


    useEffect(() => {
        console.log(JSON.stringify(filterErtot, null, 2));
    }, [filterErtot]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    const posPrograms: PosPrograms[] = filter?.map((item: PosPrograms) => {
        return item;
    }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];

    const posData: PosMonitoring[] = data?.map((item: PosMonitoring) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

    const posOptional: { name: string; value: number }[] = [
        ...posData.map((item) => ({ name: item.name, value: item.id }))
    ];

    const getRandomColor = (index: number) => {
        const colors = [
            "#5E5FCD", "#6ECD5E", "#A95ECD", "#CD5E5E"
        ];
        return colors[index % colors.length]; // Cycle through colors if needed
    };

    const portalPrograms = posPrograms.filter(program => program.posType === "Portal");

    const aggregateProgramsData = (portalPrograms: PosPrograms[]) => {
        const programMap = new Map();
    
        portalPrograms.forEach(program => {
            program.programsInfo?.forEach(info => {
                if (!programMap.has(info.programName)) {
                    programMap.set(info.programName, { 
                        programName: info.programName, 
                        counter: 0, 
                        totalProfit: 0 
                    });
                }
                const existing = programMap.get(info.programName);
                existing.counter += info.counter ?? 0;
                existing.totalProfit += info.totalProfit ?? 0;
                programMap.set(info.programName, existing);
            });
        });
    
        return Array.from(programMap.values());
    };

    const aggregatedData = aggregateProgramsData(portalPrograms);

    return (
        <>
            <FilterMonitoring
                count={posPrograms.length}
                posesSelect={posOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
                hideReset={true}
            />
            {isTableLoading || filterLoading ? (
                <div className="mt-8 space-y-6">
                    {/* Skeleton for Bar Chart Cards */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CardSkeleton cardHeight="320px" cardWidth="100%" />
                            <CardSkeleton cardHeight="320px" cardWidth="100%" />
                        </div>
                    </div>

                    {/* Skeleton for Table Card */}
                    <div>
                        <TableSkeleton columnCount={columnsProgramsPos.length} />
                    </div>
                </div>)
                : posPrograms.length > 0 ? (
                    <div className="mt-8 space-y-6">
                        {/* Render Bar Graphs only if there are "PORTAL" programs */}
                        {portalPrograms.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="h-[340px] shadow-card rounded-2xl p-4 pb-6">
                                    <Bar
                                        data={{
                                            labels: aggregatedData.map(info => info.programName),
                                            datasets: [
                                                {
                                                    label: "Кол-во авто",
                                                    data: aggregatedData.map(info => info.counter),
                                                    backgroundColor: aggregatedData.map((_info, index) => getRandomColor(index)),
                                                },
                                            ],
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            indexAxis: "y" as const,
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                title: {
                                                    display: true,
                                                    text: t("routes.programs"),
                                                    font: { size: 20 },
                                                    color: "black",
                                                    align: "start"
                                                }
                                            },
                                            scales: {
                                                x: { beginAtZero: true },
                                                y: { ticks: { font: { size: 12 } } },
                                            },
                                        }}
                                    />
                                    <div className="flex items-center justify-center text-text01">{t("pos.no")}</div>
                                </div>
                                <div className="h-[340px] shadow-card rounded-2xl p-4 pb-6">
                                    <Bar
                                        data={{
                                            labels: aggregatedData.map(info => info.programName),
                                            datasets: [
                                                {
                                                    label: "Доход",
                                                    data: aggregatedData.map(info => info.totalProfit),
                                                    backgroundColor: aggregatedData.map((_info, index) => getRandomColor(index)),
                                                },
                                            ],
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            indexAxis: "x" as const,
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                title: {
                                                    display: true,
                                                    text: t("pos.revBy"),
                                                    font: { size: 20 },
                                                    color: "black",
                                                    align: "start"
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
                        )}
                
                        {/* Render Table Section */}
                        <div className="shadow-card rounded-2xl p-4 space-y-6">
                            <div className="text-text01 font-semibold text-2xl">{t("pos.rev")}</div>
                            {posPrograms.map((deviceProgram) =>
                                <DynamicTable
                                    title={deviceProgram.name}
                                    urlTitleId={deviceProgram.id}
                                    nameUrlTitle={"/station/programs/device"}
                                    data={deviceProgram.programsInfo ? deviceProgram.programsInfo.map((p, index) => ({ id: index, ...p })) : []}
                                    columns={portalPrograms.length > 0 ? columnsProgramsPosPortal : columnsProgramsPos}
                                />
                            )}
                        </div>
                    </div>
                ) : (
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