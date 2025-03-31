import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.png";
import useSWR from "swr";
import { getPoses, readTechTasks } from "@/services/api/equipment";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsTechTasksRead } from "@/utils/OverFlowTableData";
import Filter from "@/components/ui/Filter/Filter";
import { useCity, usePosType } from "@/hooks/useAuthStore";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { Select } from "antd";

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
                    <div>
                        <div className="text-sm text-text02">{t("equipment.carWash")}</div>
                        <Select
                            className="w-full sm:w-80"
                            options={poses.map((item) => ({ label: item.name, value: item.value }))}
                            value={searchPosId}
                            onChange={(value) => setSearchPosId(value)}
                        />
                    </div>
                </div>
            </Filter>
            {techTasksLoading ? (
                <TableSkeleton columnCount={columnsTechTasksRead.length} />
            ) :
                techTasks.length > 0 ?
                    <>
                        <div className="mt-8">
                            <DynamicTable
                                data={techTasks}
                                columns={columnsTechTasksRead}
                                // isDisplayEdit={true}
                                isCheck={true}
                                navigableFields={[{ key: "name", getPath: () => "/equipment/routine/work/progress/item" }]}
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