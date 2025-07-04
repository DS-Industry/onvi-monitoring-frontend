import React, { useCallback, useEffect, useMemo } from "react";
import useSWR from "swr";
import { getProgramDevice } from "@/services/api/pos";
import {
    columnsProgramDevice,
} from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import SalyIamge from "@/assets/Saly-45.svg?react";
import { getDeviceByPosId } from "@/services/api/device";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useDeviceId, useStartDate, useEndDate, useSetStartDate, useSetEndDate, useSetDeviceId, usePosType, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageNumber, useSetPageSize } from '@/hooks/useAuthStore';
import DynamicTable from "@/components/ui/Table/DynamicTable";

interface FilterDepositDevice {
    dateStart: Date;
    dateEnd: Date;
    deviceId?: number;
    page?: number;
    size?: number;
}

interface DeviceProgram {
    id: number;
    name: string;
    dateBegin: Date;
    dateEnd: Date;
    time: string;
    localId: number;
    payType: string;
    isCar: number;
}

interface DeviceMonitoring {
    props: {
        id: number;
        name: string;
        status: string;
    };
}

const ProgramDevice: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const deviceId = useDeviceId();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();

    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setDeviceId = useSetDeviceId();
    const setCurrentPage = useSetCurrentPage();
    const setPageSize = useSetPageNumber();
    const setTotalCount = useSetPageSize();
    const posType = usePosType();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.ownerId) {
            setDeviceId(location.state.ownerId);
        }
    }, [location.state?.ownerId, setDeviceId]);

    const filterParams = useMemo(() => ({
        dateStart: startDate || `2024-10-01 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        page: currentPage,
        size: pageSize,
        deviceId: deviceId,
    }), [startDate, endDate, currentPage, pageSize, deviceId, formattedDate]);

    const swrKey = useMemo(() => {
        if (!deviceId) return null;
        return [
            'get-pos-deposits-pos-devices',
            deviceId,
            filterParams.dateStart,
            filterParams.dateEnd,
            filterParams.page,
            filterParams.size
        ];
    }, [deviceId, filterParams]);

    useEffect(() => {
        setCurrentPage(1);
    }, [location.pathname, setCurrentPage]);

    const { data: filter, isLoading: filterIsLoading } = useSWR(swrKey,
        () => getProgramDevice(
            deviceId!, {
            dateStart: filterParams.dateStart,
            dateEnd: filterParams.dateEnd,
            page: filterParams.page,
            size: filterParams.size
        }));

    const totalRecords = filter?.totalCount || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (totalRecords > 0 && currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
        }
    }, [totalRecords, maxPages, currentPage, setCurrentPage]);

    const { data } = useSWR([`get-device-pos`], () => getDeviceByPosId(posType))

    const handleDataFilter = useCallback((newFilterData: Partial<FilterDepositDevice>) => {
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if (newFilterData.deviceId) setDeviceId(newFilterData.deviceId);
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageSize(newFilterData.size);
    }, [setStartDate, setEndDate, setDeviceId, setCurrentPage, setPageSize]);

    useEffect(() => {
        if (filter?.totalCount)
            setTotalCount(filter?.totalCount)
    }, [filter?.totalCount, setTotalCount]);

    const deviceProgram: DeviceProgram[] = useMemo(() => {
        return filter?.prog?.map((item: DeviceProgram) => {
            return item;
        }).sort((a: { dateBegin: string | number | Date; }, b: { dateBegin: string | number | Date; }) => new Date(a.dateBegin).getTime() - new Date(b.dateBegin).getTime()) || []
    }, [filter?.prog]);

    const deviceData: DeviceMonitoring[] = useMemo(() => {
        return data?.map((item: DeviceMonitoring) => item)
            .sort((a, b) => a.props.id - b.props.id) || [];
    }, [data]);

    const deviceOptional: { name: string; value: number; }[] = useMemo(() => {
        return deviceData.map(
            (item) => ({ name: item.props.name, value: item.props.id })
        )
    }, [deviceData]);

    return (
        <>
            <FilterMonitoring
                count={deviceProgram.length}
                devicesSelect={deviceOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
                hideReset={true}
            />
            {
                filterIsLoading ? (<TableSkeleton columnCount={columnsProgramDevice.length} />)
                    :
                    deviceProgram.length > 0 ? (
                        <div className="mt-8 overflow-hidden">
                            <DynamicTable
                                data={deviceProgram}
                                columns={columnsProgramDevice}
                                showPagination={true}
                            />
                        </div>
                    ) : (
                        <>
                            <NoDataUI
                                title="В этом разделе представленны операции"
                                description="У вас пока нету операций"
                            >
                                <SalyIamge className="mx-auto" />
                            </NoDataUI>
                        </>
                    )}
        </>
    )
}

export default ProgramDevice;