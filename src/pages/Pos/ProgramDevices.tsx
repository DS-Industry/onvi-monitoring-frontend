import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { Table } from "antd";
import { getProgramPos } from "@/services/api/pos";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import {
    ALL_PAGE_SIZES,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
} from "@/utils/constants";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import { formatNumber, getDateRender } from "@/utils/tableUnits";
import { ColumnsType } from "antd/es/table";

type ProgramDetail = {
    programName: string;
    counter: number;
    totalTime: number;
    averageTime: string;
    lastOper?: Date;
};

type ProgramDevice = {
    id: number;
    name: string;
    programsInfo: ProgramDetail[];
};

const ProgramDevices: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);
    const posId = Number(searchParams.get("posId")) || undefined;
    const dateStart = searchParams.get("dateStart") || `${formattedDate} 00:00`;
    const dateEnd = searchParams.get("dateEnd") || `${formattedDate} 23:59`;
    const cityParam = Number(searchParams.get("city")) || undefined;


    const filterParams = useMemo(
        () => ({
            dateStart: new Date(dateStart || `${formattedDate} 00:00`),
            dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
            posId: posId || location.state?.ownerId,
            placementId: cityParam,
            page: currentPage,
            size: pageSize,
        }),
        [dateStart, dateEnd, posId, cityParam, currentPage, pageSize, location.state]
    );

    const swrKey = useMemo(
        () =>
            `get-pos-programs-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}`,
        [filterParams]
    );

    const [totalCount, setTotalCount] = useState(0);

    const { data: programRaw, isLoading: programsLoading } = useSWR(
        swrKey,
        () =>
            getProgramPos(filterParams).then((data) => {
                setTotalCount(data?.totalCount || 0);
                return data?.prog ? data.prog.sort((a, b) => a.id - b.id) : [];
            }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    /**
     * Columns for inner Table (programs list inside device row)
     */
    const programColumns: ColumnsType<ProgramDetail> = [
        {
            title: t("Программа"),
            dataIndex: "programName",
            key: "programName",
        },
        {
            title: t("Кол-во программ"),
            dataIndex: "counter",
            key: "counter",
            render: (_value, record) => formatNumber(record.counter),
            sorter: (a: ProgramDetail, b: ProgramDetail) => a.counter - b.counter,
        },
        {
            title: t("Общее время (мин)"),
            dataIndex: "totalTime",
            key: "totalTime",
            render: (_value, record) => formatNumber(record.totalTime),
        },
        {
            title: t("Среднее время (мин)"),
            dataIndex: "averageTime",
            key: "averageTime",
        },
        {
            title: t("Последняя программа"),
            dataIndex: "lastOper",
            key: "lastOper",
            render: getDateRender(),
        },
    ];

    const deviceColumns = [
        {
            title: t("Устройство"),
            dataIndex: "name",
            key: "name",
            render: (text: string, record: ProgramDevice) => (
                <Link
                    to={{
                        pathname: "/station/programs/devices",
                        search: `?posId=${record.id}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
                    }}
                    className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                    {text}
                </Link>
            ),
        },
    ];

    const {
        checkedList,
        setCheckedList,
        options,
        visibleColumns,
    } = useColumnSelector(deviceColumns, "programs-device-table-columns");

    return (
        <>
            <GeneralFilters count={totalCount} display={["pos", "city", "dateTime"]} />

            <div className="mt-8">
                <ColumnSelector
                    checkedList={checkedList}
                    options={options}
                    onChange={setCheckedList}
                />
                <Table
                    rowKey="id"
                    loading={programsLoading}
                    dataSource={programRaw}
                    columns={visibleColumns}
                    scroll={{ x: "max-content" }}
                    expandable={{
                        expandedRowRender: (record: ProgramDevice) => (
                            <Table
                                rowKey={(row) => `${record.id}-${row.programName}`}
                                dataSource={record.programsInfo}
                                columns={programColumns}
                                pagination={false}
                                bordered
                                size="small"
                            />
                        ),
                        rowExpandable: (record) =>
                            Array.isArray(record.programsInfo) &&
                            record.programsInfo.length > 0,
                    }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        pageSizeOptions: ALL_PAGE_SIZES,
                        showTotal: (_total, range) =>
                            `${range[0]}-${range[1]} of ${totalCount} devices`,
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
    );
};

export default ProgramDevices;
