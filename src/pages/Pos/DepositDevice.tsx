import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getDepositDevice } from "@/services/api/pos";
import {
    columnsMonitoringDevice,
} from "@/utils/OverFlowTableData.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import NoDataUI from "@ui/NoDataUI.tsx";
import { useLocation } from "react-router-dom";
import { getDeviceByPosId } from "@/services/api/device";
import FilterMonitoring from "@ui/Filter/FilterMonitoring.tsx";
import SalyIamge from "@/assets/Saly-45.svg?react";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useDeviceId, useStartDate, useEndDate, useSetDeviceId, useSetStartDate, useSetEndDate, usePosType, useCurrentPage, usePageNumber, useSetCurrentPage, useSetPageNumber, useSetPageSize } from '@/hooks/useAuthStore';

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

    useEffect(() => {
        if (location.state?.ownerId) {
            setDeviceId(location.state.ownerId);
        }
    }, [location.state?.ownerId, setDeviceId]);

    const [isTableLoading, setIsTableLoading] = useState(false);
    const initialFilter = {
        dateStart: startDate || `2024-10-01 00:00`,
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

    const { data: filter, error: filterError, isLoading: filterIsLoading, mutate: filterMutate } = useSWR(deviceId ? [`get-pos-deposits-pos-devices`, deviceId] : null, () => getDepositDevice(
        deviceId ? deviceId : 0, {
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
        page: dataFilter.page,
        size: dataFilter.size
    }));

    const { data } = useSWR([`get-device-pos`], () => getDeviceByPosId(posType));

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
        console.log(JSON.stringify(filterError, null, 2));
    }, [filterError]);

    useEffect(() => {
        filterMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, filterMutate]);

    useEffect(() => {
        if (!filterIsLoading && filter?.totalCount)
            setTotalCount(filter?.totalCount)
    }, [filter?.totalCount, filterIsLoading, setTotalCount]);

    const deviceMonitoring: DepositDeviceResponse[] = filter?.oper?.map((item: DepositDeviceResponse) => {
        return item;
    }).sort((a: { dateOper: Date; }, b: { dateOper: Date; }) => new Date(a.dateOper).getTime() - new Date(b.dateOper).getTime()) || [];

    const deviceData: DeviceMonitoring[] = data?.map((item: DeviceMonitoring) => {
        return item;
    }).sort((a, b) => a.props.id - b.props.id) || [];

    const deviceOptional: { name: string; value: number; }[] = deviceData.map(
        (item) => ({ name: item.props.name, value: item.props.id })
    );

    return (
        <>
            <FilterMonitoring
                count={deviceMonitoring.length}
                devicesSelect={deviceOptional}
                handleDataFilter={handleDataFilter}
                hideCity={true}
                hideSearch={true}
            />
            {isTableLoading || filterIsLoading ? (<TableSkeleton columnCount={columnsMonitoringDevice.length} />)
                :
                deviceMonitoring.length > 0 ? (
                    <div className="mt-8">
                        <OverflowTable
                            tableData={deviceMonitoring}
                            columns={columnsMonitoringDevice}
                            isDisplayEdit={true}
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

export default DepositDevice;