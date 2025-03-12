import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.png";
import useSWR from "swr";
import { getPoses, readTechTasks } from "@/services/api/equipment";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsTechTasksRead } from "@/utils/OverFlowTableData";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import { useCity, usePosType } from "@/hooks/useAuthStore";

type ReadTechTasks = {
    id: number;
    name: string;
    posId: number;
    type: string;
    status: string;
    endSpecifiedDate?: Date;
    startWorkDate?: Date;
    sendWorkDate?: Date;
    executorId?: number;
}

const ProgressReport: React.FC = () => {
    const { t } = useTranslation();
    const posType = usePosType();
    const [searchPosId, setSearchPosId] = useState(posType);
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data, isLoading: techTasksLoading } = useSWR([`get-tech-tasks`, searchPosId, city], () => readTechTasks({
        posId: searchPosId,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const techTasks: ReadTechTasks[] = data
        ?.filter((item: { posId: number }) => item.posId === searchPosId)
        ?.map((item: ReadTechTasks) => ({
            ...item,
            posName: poses.find((pos) => pos.value === item.posId)?.name || "-",
            type: t(`tables.${item.type}`),
            status: t(`tables.${item.status}`)
        }))
        .sort((a, b) => a.id - b.id) || [];

    return (
        <>
            <Filter count={techTasks.length} hideDateTime={true} hideCity={true} hideSearch={true}>
                <div className="flex">
                    <DropdownInput
                        title={t("equipment.carWash")}
                        value={searchPosId}
                        classname={"w-full sm:w-80"}
                        options={poses}
                        onChange={(value) => setSearchPosId(value)}
                    />
                </div>
            </Filter>
            {techTasksLoading ? (
                <TableSkeleton columnCount={columnsTechTasksRead.length} />
            ) :
                techTasks.length > 0 ?
                    <>
                        <div className="mt-8">
                            <OverflowTable
                                tableData={techTasks}
                                columns={columnsTechTasksRead}
                                isDisplayEdit={true}
                                isCheck={true}
                                nameUrl="/equipment/routine/work/progress/item"
                            />
                        </div>
                    </>
                    :
                    <NoDataUI
                        title={t("routine.reports")}
                        description={""}
                    >
                        <img src={SalyImage} className="mx-auto" />
                    </NoDataUI>
            }
        </>
    )
}

export default ProgressReport;