import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import { getProgramDevice } from "@/services/api/pos";
import { getDeviceByPosId } from "@/services/api/device";

import { Table } from "antd";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";

import { updateSearchParams } from "@/utils/updateSearchParams";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import { formatNumber, getDateRender } from "@/utils/tableUnits";

import {
    ALL_PAGE_SIZES,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE
} from "@/utils/constants";

import { ColumnsType } from "antd/es/table";

// Types
type FilterProgramDevice = {
    dateStart: string;
    dateEnd: string;
    deviceId?: number;
    page?: number;
    size?: number;
};

interface ProgramDeviceType {
    id: number;
    name: string;
    dateBegin: Date | string;
    dateEnd: Date | string;
    time: string;
    localId: number;
    payType: string;
    isCar: number;
}

type DeviceOption = {
    props: {
        id: number;
        name: string;
    };
};

const ProgramDevice: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const formattedDate = dayjs().format("YYYY-MM-DD");

    const posId = Number(searchParams.get("posId") || 0);
    const deviceId = Number(searchParams.get("deviceId") || 0);
    const dateStart = searchParams.get("dateStart") || `${formattedDate} 00:00`;
    const dateEnd = searchParams.get("dateEnd") || `${formattedDate} 23:59`;
    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Filter params (memoized)
    const filterParams: FilterProgramDevice = useMemo(
        () => ({
            dateStart,
            dateEnd,
            page: currentPage,
            size: pageSize,
            deviceId,
        }),
        [dateStart, dateEnd, currentPage, pageSize, deviceId]
    );

    // SWR key and data fetch
    const swrKey = useMemo(() => {
        if (!deviceId) return null;
        return [
            "get-program-devices",
            deviceId,
            filterParams.dateStart,
            filterParams.dateEnd,
            filterParams.page,
            filterParams.size,
        ];
    }, [deviceId, filterParams]);

    const { data: filterData, isLoading } = useSWR(
        swrKey,
        () =>
            getProgramDevice(deviceId, {
                dateStart: new Date(filterParams.dateStart),
                dateEnd: new Date(filterParams.dateEnd),
                page: filterParams.page,
                size: filterParams.size,
            }).finally(() => {
                setIsInitialLoading(false);
            }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // Device list for filter
    const { data: deviceList } = useSWR(
        "get-device-pos",
        () => getDeviceByPosId(posId),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // Options for device selection dropdown
    const deviceOptions = useMemo(() => {
        return (
            deviceList?.map((d: DeviceOption) => ({
                name: d.props.name,
                value: d.props.id,
            })) || []
        );
    }, [deviceList]);

    // Table columns
    const dateRender = getDateRender();
    const columnsProgramDevice: ColumnsType<ProgramDeviceType> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id
        },
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Начало программы",
            dataIndex: "dateBegin",
            key: "dateBegin",
            render: dateRender,
        },
        {
            title: "Конец программы",
            dataIndex: "dateEnd",
            key: "dateEnd",
            render: dateRender,
        },
        {
            title: "Время выполнения",
            dataIndex: "time",
            key: "time",
        },
        {
            title: "Локальный ID",
            dataIndex: "localId",
            key: "localId",
            render: (_value, record) => formatNumber(record.localId)
        },
        {
            title: "Оплата",
            dataIndex: "payType",
            key: "payType",
        },
        {
            title: "Машина",
            dataIndex: "isCar",
            key: "isCar",
        },
    ];

    // Data: sorted by dateBegin
    const programDevices = useMemo(() => {
        return (
            filterData?.prog?.sort(
                (a: ProgramDeviceType, b: ProgramDeviceType) =>
                    new Date(a.dateBegin).getTime() - new Date(b.dateBegin).getTime()
            ) || []
        );
    }, [filterData]);

    const totalCount = filterData?.totalCount || 0;

    // Column selector hook
    const { checkedList, setCheckedList, options, visibleColumns } =
        useColumnSelector(columnsProgramDevice, "program-devices-table-columns");

    return (
        <>
            <GeneralFilters
                devicesSelect={deviceOptions}
                count={totalCount}
                hideCity={true}
                hideSearch={true}
                hideReset={true}
            />

            <div className="mt-8">
                <ColumnSelector
                    checkedList={checkedList}
                    options={options}
                    onChange={setCheckedList}
                />

                <Table
                    rowKey="id"
                    dataSource={programDevices}
                    columns={visibleColumns}
                    loading={isLoading || isInitialLoading}
                    scroll={{ x: "max-content" }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        pageSizeOptions: ALL_PAGE_SIZES,
                        showTotal: (total, range) =>
                            `${range[0]}–${range[1]} из ${total} записей`,
                        onChange: (page, size) =>
                            updateSearchParams(searchParams, setSearchParams, {
                                page: String(page),
                                size: String(size),
                            }),
                    }}
                />
            </div>
        </>
    );
};

export default ProgramDevice;
