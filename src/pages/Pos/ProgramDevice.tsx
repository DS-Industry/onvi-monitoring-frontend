import React, { useEffect, useState } from "react";
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

    const [isTableLoading, setIsTableLoading] = useState(false);
    const initialFilter = {
        dateStart: startDate || `${formattedDate} 00:00`,
        dateEnd: endDate || `${formattedDate} 23:59`,
        page: currentPage,
        size: pageSize,
        deviceId: deviceId,
    };
    const [dataFilter, setIsDataFilter] = useState<FilterDepositDevice>(initialFilter);

    useEffect(() => {
        setCurrentPage(1);
        setIsDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate } = useSWR(deviceId ? [`get-pos-program-pos-devices`, deviceId] : null, () => getProgramDevice(
        deviceId ? deviceId : 0, {
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
        page: dataFilter.page,
        size: dataFilter.size
    }));

    const totalRecords = filter?.totalCount || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
            setIsDataFilter((prevFilter) => ({
                ...prevFilter,
                page: maxPages > 0 ? maxPages : 1
            }));
        }
    }, [maxPages, currentPage, setCurrentPage]);

    const { data } = useSWR([`get-device-pos`], () => getDeviceByPosId(posType))

    const handleDataFilter = (newFilterData: Partial<FilterDepositDevice>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);

        if (newFilterData.dateStart) setStartDate(newFilterData.dateStart);
        if (newFilterData.dateEnd) setEndDate(newFilterData.dateEnd);
        if (newFilterData.deviceId) setDeviceId(newFilterData.deviceId);
        if (newFilterData.page) setCurrentPage(newFilterData.page);
        if (newFilterData.size) setPageSize(newFilterData.size);
    };
    useEffect(() => {
    }, [filterError]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    useEffect(() => {
        if (!filterIsLoading && filter?.totalCount)
            setTotalCount(filter?.totalCount)
    }, [filter?.totalCount, filterIsLoading, setTotalCount]);

    const deviceProgram: DeviceProgram[] = filter?.prog?.map((item: DeviceProgram) => {
        return item;
    }).sort((a: { dateBegin: string | number | Date; }, b: { dateBegin: string | number | Date; }) => new Date(a.dateBegin).getTime() - new Date(b.dateBegin).getTime()) || [];

    const deviceData: DeviceMonitoring[] = data?.map((item: DeviceMonitoring) => {
        return item;
    }).sort((a, b) => a.props.id - b.props.id) || [];

    const deviceOptional: { name: string; value: number; }[] = deviceData.map(
        (item) => ({ name: item.props.name, value: item.props.id })
    );

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
                isTableLoading || filterIsLoading ? (<TableSkeleton columnCount={columnsProgramDevice.length} />)
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