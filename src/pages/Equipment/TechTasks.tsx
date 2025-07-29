import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPoses, getTechTaskExecution, TechTaskReadAll } from "@/services/api/equipment";
import useSWR from "swr";
import { Table } from "antd";
import { useSearchParams } from "react-router-dom";
import {
    ALL_PAGE_SIZES,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
} from "@/utils/constants";
import { updateSearchParams } from "@/utils/updateSearchParams";
import { getDateRender, getStatusTagRender, getTagRender } from "@/utils/tableUnits";
import { ColumnsType } from "antd/es/table";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import { CheckCircleOutlined } from "@ant-design/icons";

const TechTasks: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);

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
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { data, isLoading: techTasksLoading } = useSWR(swrKey, () => getTechTaskExecution(filterParams).then(
        (data) => {
            const sorted = [...(data.techTaskReadAll ?? [])].sort((a, b) => a.id - b.id);
            return sorted;
        }).finally(() => {
            setIsInitialLoading(false);
        }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: poses } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }).then(
        (data) => data?.map((item) => ({ name: item.name, value: item.id })) || []
    ), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });


    const techTasks = useMemo(() => data
        ?.map((item) => ({
            ...item,
            type: t(`tables.${item.type}`),
            posName: poses?.find((pos) => pos.value === item.posId)?.name,
            status: t(`tables.${item.status}`)
        })) || [], []);

    const renderStatus = getStatusTagRender(t);
    const dateRender = getDateRender();

    const statuses = [
        { text: t("tables.ACTIVE"), value: t("tables.ACTIVE") },
        { text: t("tables.OVERDUE"), value: t("tables.OVERDUE") },
    ];

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
            key: "posName",
            filters: poses?.map((pos) => ({ text: pos.name, value: pos.name })),
            onFilter: (value, record) => record.posId === poses?.find((item) => item.name === value)?.value,
        },
        {
            title: "Наименование работ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Периодичность",
            dataIndex: "period",
            key: "period",
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            filters: statuses,
            onFilter: (value, record) => record.status === value,
            render: renderStatus,
        },
        {
            title: "Тип работы",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "Теги",
            dataIndex: "tags",
            key: "tags",
            render: (value) => getTagRender(value),
        },
        {
            title: "Дата начала работ",
            dataIndex: "startDate",
            key: "startDate",
            render: dateRender,
        },
    ]

    const { checkedList, setCheckedList, options, visibleColumns } =
        useColumnSelector(columnsTechTasks, "tech-tasks-columns");

    return (
        <>
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
                        total: techTasks.length,
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

export default TechTasks;