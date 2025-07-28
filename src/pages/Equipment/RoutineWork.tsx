import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPoses, getTechTaskExecution, StatusTechTask, TechTaskReadAll } from "@/services/api/equipment";
import useSWR from "swr";
import { Select, Table } from "antd";
import { useSearchParams } from "react-router-dom";
import {
    ALL_PAGE_SIZES,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
} from "@/utils/constants";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { updateSearchParams } from "@/utils/updateSearchParams";
import { getDateRender, getStatusTagRender, getTagRender } from "@/utils/tableUnits";
import { ColumnsType } from "antd/es/table";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import { CheckCircleOutlined } from "@ant-design/icons";

const RoutineWork: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);
    const posId = searchParams.get("posId") || "*";
    const status = searchParams.get("status") || StatusTechTask.ACTIVE;

    const filterParams = {
        page: currentPage,
        size: pageSize
    }

    const swrKey = useMemo(
        () =>
            `get-tech-tasks-${filterParams.page}-${filterParams.size}`,
        [filterParams]
    );

    const city = searchParams.get("city") || "*";
    const [totalTechTasksCount, setTotalTechTasksCount] = useState(0);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { data, isLoading: techTasksLoading } = useSWR(swrKey, () => getTechTaskExecution(filterParams).then(
        (data) => {
            setTotalTechTasksCount(data.totalCount);
            const sorted = [...(data.techTaskReadAll ?? [])].sort((a, b) => a.id - b.id);

            return sorted;
        }).finally(() => {
            setIsInitialLoading(false);
        }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number | string; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const posesAllObj = {
        name: allCategoriesText,
        value: "*"
    };

    poses.unshift(posesAllObj);

    const techTasks = data
        ?.filter((item: { posId: number }) => item.posId === Number(posId) || posId === "*")
        ?.filter((item: { status: string }) => item.status === status)
        ?.map((item) => ({
            ...item,
            type: t(`tables.${item.type}`),
            posName: poses.find((pos) => pos.value === item.posId)?.name,
            status: item.status === "ACTIVE" ? t(`tables.In Progress`) : item.status === "FINISHED" ? t(`tables.Done`) : t(`tables.${item.status}`)
        }))
        .sort((a, b) => a.id - b.id) || [];

    const renderStatus = getStatusTagRender(t);
    const dateRender = getDateRender();

    const columnsTechTasks: ColumnsType<TechTaskReadAll> = [
        {
            title: "",
            dataIndex: "statusCheck",
            key: "statusCheck",
            render: (_: unknown, record) =>
                record.status === t("tables.FINISHED") ? (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : null,
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
            dataIndex: "period",
            key: "period"
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            render: renderStatus
        },
        {
            title: "Тип работы",
            dataIndex: "type",
            key: "type"
        },
        {
            title: "Теги",
            dataIndex: "tags",
            key: "tags",
            render: (value) => getTagRender(value)
        },
        {
            title: "Дата начала работ",
            dataIndex: "startDate",
            key: "startDate",
            render: dateRender
        }
    ]

    const { checkedList, setCheckedList, options, visibleColumns } =
        useColumnSelector(columnsTechTasks, "tech-tasks-columns");

    const statuses = [
        { label: t("tables.In Progress"), value: StatusTechTask.ACTIVE },
        { label: t("tables.OVERDUE"), value: StatusTechTask.OVERDUE }
    ]

    return (
        <>
            <GeneralFilters count={techTasks.length} hideDateAndTime={true} hideCity={true} hideSearch={true}>
                <div className="flex space-x-2 flex-col sm:flex-row">
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
                    <div>
                        <div className="text-sm text-text02">{t("finance.status")}</div>
                        <Select
                            className="w-full sm:w-80"
                            options={statuses}
                            value={searchParams.get("status")}
                            onChange={(value) => {
                                updateSearchParams(searchParams, setSearchParams, {
                                    status: value
                                });
                            }}
                            size="large"
                        />
                    </div>
                </div>
            </GeneralFilters>
            <div className="mt-8">
                <ColumnSelector
                    checkedList={checkedList}
                    options={options}
                    onChange={setCheckedList}
                />
                <Table
                    dataSource={techTasks}
                    columns={visibleColumns}
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
                />
            </div>
        </>
    )
}

export default RoutineWork;