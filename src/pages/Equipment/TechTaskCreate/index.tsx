import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPoses, getTechTaskManage, TechTaskManagerInfo } from "@/services/api/equipment";
import useSWR from "swr";
import { Table, Tooltip } from "antd";
import { useSearchParams } from "react-router-dom";
import {
    ALL_PAGE_SIZES,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
} from "@/utils/constants";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { getDateRender, getStatusTagRender, getTagRender } from "@/utils/tableUnits";
import { ColumnsType } from "antd/es/table";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import TechTaskForm, { TechTaskFormRef } from "./TechTaskForm";
import AntDButton from "antd/es/button";
import { EditOutlined } from '@ant-design/icons';

const TechTaskCreate: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);
    const posId = Number(searchParams.get("posId")) || undefined;

    const swrKey = useMemo(
        () =>
            `get-tech-tasks-${currentPage}-${pageSize}-${posId}`,
        [currentPage, pageSize, posId]
    );
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { data, isLoading: techTasksLoading } = useSWR(swrKey, () => getTechTaskManage({
        posId: posId,
        page: currentPage,
        size: pageSize
    }).finally(() => {
        setIsInitialLoading(false);
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: poses } = useSWR([`get-pos`], () => getPoses({ placementId: '*' }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const techTasks = data
        ?.techTaskManageInfo.map((item) => ({
            ...item,
            type: t(`tables.${item.type}`),
            posName: poses?.find((pos) => pos.id === item.posId)?.name,
            status: item.status === "ACTIVE" ? t(`tables.In Progress`) : item.status === "FINISHED" ? t(`tables.Done`) : t(`tables.${item.status}`)
        })) || [];

    const renderStatus = getStatusTagRender(t);
    const dateRender = getDateRender();

    const formRef = useRef<TechTaskFormRef>(null);

    const onUpdate = (id: number) => {
        formRef.current?.handleUpdate(id);
    };

    const columnsTechTasks: ColumnsType<TechTaskManagerInfo> = [
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
        },
        {
            title: "",
            dataIndex: "actions",
            key: "actions",
            render: (_: unknown, record: { id: number; }) => (
                <Tooltip title="Редактировать">
                    <AntDButton
                        type="text"
                        icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
                        onClick={() => onUpdate(record.id)}
                        style={{ height: "24px" }}
                    />
                </Tooltip>
            ),
        }
    ]

    const resetFilters = () => {
        updateSearchParams(searchParams, setSearchParams, {
            posId: undefined
        });
    }

    const { checkedList, setCheckedList, options: optionsColumns, visibleColumns } =
        useColumnSelector(columnsTechTasks, "tech-tasks-columns");

    return (
        <>
            <GeneralFilters
                count={data?.totalCount || 0}
                hideDateAndTime={true}
                hideCity={true}
                hideSearch={true}
                poses={poses?.map((item) => ({ name: item.name, value: item.id }))}
                onReset={resetFilters}
            />
            <div className="mt-8">
                <ColumnSelector
                    checkedList={checkedList}
                    options={optionsColumns}
                    onChange={setCheckedList}
                />
                <Table
                    dataSource={techTasks.sort((a, b) => a.id - b.id)}
                    columns={visibleColumns}
                    loading={techTasksLoading || isInitialLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: data?.totalCount || 0,
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
                    scroll={{ x: "max-content" }}
                />
            </div>
            <TechTaskForm
                swrKey={swrKey}
                techTasks={techTasks}
                ref={formRef}
            />
        </>
    )
}

export default TechTaskCreate;