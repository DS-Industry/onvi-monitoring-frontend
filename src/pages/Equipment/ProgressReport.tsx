import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getPoses, getTechTaskManage } from "@/services/api/equipment";
import { Select, Table } from "antd";
import { useSearchParams } from "react-router-dom";
import { ALL_PAGE_SIZES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/utils/constants";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { updateSearchParams } from "@/utils/updateSearchParams";
import { ColumnsType } from "antd/es/table";
import { getDateRender, getStatusTagRender } from "@/utils/tableUnits";

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
    const allCategoriesText = t("warehouse.all");
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);
    const posId = searchParams.get("posId");
    const city = searchParams.get("city") || '*';
    const [totalTechTasksCount, setTotalTechTasksCount] = useState(0);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const filterParams = {
        posId: Number(posId),
        page: currentPage,
        size: pageSize
    }

    const swrKey = useMemo(
        () =>
            `get-tech-tasks-${filterParams.page}-${filterParams.size}-${filterParams.posId}`,
        [filterParams]
    );

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data, isLoading: techTasksLoading } = useSWR(swrKey, () => getTechTaskManage(filterParams).then(
        (data) => {
            setTotalTechTasksCount(data.totalCount);
            const sorted = [...(data.techTaskManageInfo ?? [])].sort((a, b) => a.id - b.id);

            return sorted;
        }).finally(() => {
            setIsInitialLoading(false);
        }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });


    const poses: { name: string; value: number | string; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    poses.unshift(posesAllObj);

    const techTasks: ReadTechTasks[] = data
        ?.filter((item: { posId: number }) => item.posId === Number(posId))
        ?.map((item: ReadTechTasks) => ({
            ...item,
            posName: poses.find((pos) => pos.value === item.posId)?.name || "-",
            type: t(`tables.${item.type}`),
            status: t(`tables.${item.status}`)
        }))
        .sort((a, b) => a.id - b.id) || [];

    const statusRender = getStatusTagRender(t);
    const dateRender = getDateRender();

    const columnsTechTasksRead: ColumnsType<ReadTechTasks> = [
        {
            title: "№",
            dataIndex: "id",
            key: "id"
        },
        {
            title: "Автомойка/ Филиал",
            dataIndex: "posName",
            key: "posName"
        },
        {
            title: "Наименование работ",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Периодичность",
            dataIndex: "type",
            key: "type"
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            render: statusRender
        },
        {
            title: "Дата начала",
            dataIndex: "startWorkDate",
            key: "startWorkDate",
            render: dateRender
        },
        {
            title: "Дата окончания",
            dataIndex: "sendWorkDate",
            key: "sendWorkDate",
            render: dateRender
        },
        {
            title: "Исполнитель",
            dataIndex: "executorId",
            key: "executorId"
        }
    ]

    return (
        <>
            <GeneralFilters count={techTasks.length} hideDateAndTime={true} hideCity={true} hideSearch={true}>
                <div className="flex">
                    <div>
                        <div className="text-sm text-text02">{t("equipment.carWash")}</div>
                        <Select
                            className="w-full sm:w-80"
                            options={poses.map((item) => ({ label: item.name, value: String(item.value) }))}
                            value={searchParams.get("posId")}
                            onChange={(value) => {
                                updateSearchParams(searchParams, setSearchParams, {
                                    posId: value
                                });
                            }}
                            size="large"
                        />
                    </div>
                </div>
            </GeneralFilters>
            <div className="mt-8">
                <Table
                    dataSource={techTasks}
                    columns={columnsTechTasksRead}
                    loading={techTasksLoading || isInitialLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalTechTasksCount,
                        pageSizeOptions: ALL_PAGE_SIZES,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`,
                        onChange: (page, size) => {
                            updateSearchParams(searchParams, setSearchParams, {
                                page: String(page),
                                size: String(size),
                            });
                        },
                    }}
                // isDisplayEdit={true}
                // isCheck={true}
                // navigableFields={[{ key: "name", getPath: () => "/equipment/routine/work/progress/item" }]}
                />
            </div>
        </>
    )
}

export default ProgressReport;