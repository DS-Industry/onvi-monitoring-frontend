import React, { useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import { getDepositDevice } from "@/services/api/pos";
import {
    columnsMonitoringDevice,
} from "@/utils/OverFlowTableData.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import { getDeviceByPosId } from "@/services/api/device";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useDeviceId, useStartDate, useEndDate, useSetDeviceId, useSetStartDate, useSetEndDate, usePosType, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageNumber, useSetPageSize } from '@/hooks/useAuthStore';
import DynamicTable from "@/components/ui/Table/DynamicTable";

type DeviceMonitoring = {
    props: {
        id: number;
        name: string;
        carWashDeviceMetadata: string;
        status: string;
        ipAddress: string;
        carWashDeviceTypeId: string;
        carWashPosId: number;
        deviceRoleId: number;
    }
}

type FilterDepositDevice = {
    dateStart: Date;
    dateEnd: Date;
    deviceId?: number;
    page?: number;
    size?: number;
}

type DepositDeviceResponse = {
    id: number;
    sumOper: number;
    dateOper: Date;
    dateLoad: Date;
    counter: number;
    localId: number;
    currencyType: string;
}

const DepositDevice: React.FC = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const deviceId = useDeviceId();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const currentPage = useCurrentPage();
    const pageSize = usePageNumber();

    const setDeviceId = useSetDeviceId();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const setCurrentPage = useSetCurrentPage();
    const setPageSize = useSetPageNumber();
    const setTotalCount = useSetPageSize();
    const posType = usePosType();
    const location = useLocation();

    // Initialize device ID from location state only once
    useEffect(() => {
        if (location.state?.ownerId && !deviceId) {
            setDeviceId(location.state.ownerId);
        }
    }, [location.state?.ownerId, setDeviceId, deviceId]);

    // Memoize the filter parameters to prevent unnecessary re-renders
    const filterParams = useMemo(() => ({
        dateStart: startDate || `2024-10-01 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        page: currentPage,
        size: pageSize,
        deviceId: deviceId,
    }), [startDate, endDate, currentPage, pageSize, deviceId, formattedDate]);

    // Create a stable key for SWR that changes only when filter params change
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

    // Single SWR call with stable key
    const { data: filter, isLoading: filterIsLoading } = useSWR(
        swrKey,
        () => getDepositDevice(deviceId!, {
            dateStart: filterParams.dateStart,
            dateEnd: filterParams.dateEnd,
            page: filterParams.page,
            size: filterParams.size
        }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const totalRecords = filter?.totalCount || 0; 
    const maxPages = Math.ceil(totalRecords / pageSize); 

    // Handle page overflow only when necessary
    useEffect(() => {
        if (totalRecords > 0 && currentPage > maxPages && maxPages > 0) {
            setCurrentPage(maxPages);
        }
    }, [totalRecords, currentPage, maxPages, setCurrentPage]);

    // Reset to first page when location changes
    useEffect(() => {
        setCurrentPage(1);
    }, [location.pathname, setCurrentPage]);

    const { data } = useSWR([`get-device-pos`], () => getDeviceByPosId(posType));

    // Update total count only when filter data changes
    useEffect(() => {
        if (filter?.totalCount) {
            setTotalCount(filter.totalCount);
        }
    }, [filter?.totalCount, setTotalCount]);

    // Optimized filter handler
    const handleDataFilter = useCallback((newFilterData: Partial<FilterDepositDevice>) => {
        // Update store values
        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if (newFilterData.deviceId) setDeviceId(newFilterData.deviceId);
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageSize(newFilterData.size);
    }, [setStartDate, setEndDate, setDeviceId, setCurrentPage, setPageSize]);

    // Memoize processed data to prevent unnecessary recalculations
    const deviceMonitoring: DepositDeviceResponse[] = useMemo(() => {
        return filter?.oper?.map((item: DepositDeviceResponse) => item)
            .sort((a: { dateOper: Date; }, b: { dateOper: Date; }) => 
                new Date(a.dateOper).getTime() - new Date(b.dateOper).getTime()
            ) || [];
    }, [filter?.oper]);

    const deviceData: DeviceMonitoring[] = useMemo(() => {
        return data?.map((item: DeviceMonitoring) => item)
            .sort((a, b) => a.props.id - b.props.id) || [];
    }, [data]);

    const deviceOptional: { name: string; value: number; }[] = useMemo(() => {
        return deviceData.map(
            (item) => ({ name: item.props.name, value: item.props.id })
        );
    }, [deviceData]);

    return (
        <>
            <FilterMonitoring
                count={deviceMonitoring.length}
                devicesSelect={deviceOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
                hideReset={true}
            />
            {filterIsLoading ? (
                <TableSkeleton columnCount={columnsMonitoringDevice.length} />
            ) : deviceMonitoring.length > 0 ? (
                <div className="mt-8">
                    <DynamicTable
                        data={deviceMonitoring}
                        columns={columnsMonitoringDevice}
                        isDisplayEdit={true}
                        showPagination={true}
                    />
                </div>
            ) : (
                <NoDataUI
                    title="В этом разделе представленны операции"
                    description="У вас пока нету операций"
                >
                    <SalyIamge className="mx-auto" />
                </NoDataUI>
            )}
        </>
    )
}

export default DepositDevice;